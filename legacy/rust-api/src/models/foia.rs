use serde::{Deserialize, Serialize};

/// frontend when generating
#[derive(Deserialize)]
pub struct GenerateFOIAPayload {
    pub agency_name: String,
    pub request_info: String,
}

/// chat jippity FOIA response
#[derive(Serialize)]
pub struct GenerateFOIAResponse {
    pub generated_text: String,
}
