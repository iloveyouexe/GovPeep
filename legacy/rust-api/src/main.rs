use actix_web::{web, App, HttpServer, http};
use actix_cors::Cors;
use dotenv::dotenv;
use sqlx::PgPool;
use std::env;

mod models;
mod handlers;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = match PgPool::connect(&database_url).await {
        Ok(pool) => pool,
        Err(e) => {
            let redacted = redact_database_url(&database_url);
            eprintln!("Failed to connect to DATABASE_URL: {redacted}");
            eprintln!("sqlx error: {e}");
            eprintln!(
                "Expected format: postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
            );
            return Err(std::io::Error::new(std::io::ErrorKind::Other, e));
        }
    };

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:5173") // ✅ Allow frontend origin
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![http::header::CONTENT_TYPE, http::header::AUTHORIZATION])
            .allow_any_header()
            .allow_any_origin()
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .app_data(web::Data::new(pool.clone()))
            .route("/api/agencies", web::get().to(handlers::agencies::get_agencies))
            .route("/api/generate_foia", web::post().to(handlers::foia::generate_foia))
    })
        .bind("127.0.0.1:8080")?
        .run()
        .await
}

fn redact_database_url(database_url: &str) -> String {
    if let Some(scheme_end) = database_url.find("://") {
        let scheme = &database_url[..scheme_end + 3];
        let rest = &database_url[scheme_end + 3..];

        if let Some(at) = rest.find('@') {
            let (userinfo, after_at) = rest.split_at(at);
            let after_at = &after_at[1..];

            if let Some(colon) = userinfo.find(':') {
                let user = &userinfo[..colon];
                return format!("{scheme}{user}:***@{after_at}");
            }

            return format!("{scheme}***@{after_at}");
        }
    }

    database_url.to_string()
}
