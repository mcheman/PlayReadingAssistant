use std::time::Duration;
use axum::{
    Router,
};
use sqlx::postgres::PgPoolOptions;

mod actors;
mod db;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().expect("Could not find .env file");

    let db_connection_str = dotenvy::var("DATABASE_URL")
        .expect("Could not connect to postgres database at DATABASE_URL");

    // setup connection pool
    let pool = PgPoolOptions::new()
        .max_connections(128)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&db_connection_str)
        .await
        .expect("can't connect to database");

    let app = Router::new()
        .nest("/api", actors::routes(pool));

    // run it with hyper on localhost:3000
    axum::Server::bind(&"127.0.0.1:8000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}