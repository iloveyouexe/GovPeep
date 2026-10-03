use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::NaiveDateTime;

#[derive(Serialize, Deserialize, sqlx::FromRow)]
pub struct Agency {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub website: String,
    pub phone_number: Option<String>,
    pub logo: Option<String>,
    pub governance: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}
