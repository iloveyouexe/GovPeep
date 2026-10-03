use actix_web::{post, web, HttpResponse, Responder};
use serde_json::json;
use reqwest::Client;
use std::env;

use crate::models::foia::{GenerateFOIAPayload, GenerateFOIAResponse};

pub async fn generate_foia(
    payload: web::Json<GenerateFOIAPayload>,
) -> impl Responder {
    // prompt from user input
    let prompt = format!(
        "Write a FOIA request letter to the agency named: {}\n\
         Request details: {}\n\
         The letter should be concise, formal, and address any relevant fee waivers.",
        payload.agency_name,
        payload.request_info
    );

    // ring up sam altman
    match call_openai_api(&prompt).await {
        Ok(generated_text) => {
            let response = GenerateFOIAResponse { generated_text };
            HttpResponse::Ok().json(response)
        }
        Err(e) => {
            eprintln!("Error calling OpenAI API: {:?}", e);
            HttpResponse::InternalServerError().json(json!({ "error": "Failed to generate FOIA text" }))
        }
    }
}

/// reqwest helper function
async fn call_openai_api(prompt: &str) -> Result<String, Box<dyn std::error::Error>> {
    let api_key = env::var("CLAUDEAI_API_KEY")?;
    let client = Client::new();

    let body = json!({
        "model": "text-davinci-003",
        "prompt": prompt,
        "max_tokens": 200,
        "temperature": 0.7
    });

    let openai_response = client
        .post("https://api.openai.com/v1/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&body)
        .send()
        .await?;

    if !openai_response.status().is_success() {
        let status = openai_response.status();
        let err_text = openai_response.text().await.unwrap_or_default();
        return Err(format!("OpenAI API returned status {}: {}", status, err_text).into());
    }

    let json_body: serde_json::Value = openai_response.json().await?;
    let generated_text = json_body["choices"][0]["text"]
        .as_str()
        .unwrap_or("No text found")
        .to_string();

    Ok(generated_text)
}
