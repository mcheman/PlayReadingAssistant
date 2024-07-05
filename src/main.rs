use dotenvy::dotenv;
use play_reading_party::{configure_database, get_server, migrate_database};
use std::net::TcpListener;
use std::path::PathBuf;

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    dotenv().ok();
    let listener =
        TcpListener::bind("127.0.0.1:8000").expect("Port 8000 should be free to bind to");
    let database_uri =
        std::env::var("DATABASE_URL").expect("DATABASE_URL should be set in .env file");
    let db_pool = configure_database(database_uri);

    let upload_dir = PathBuf::from(
        std::env::var("UPLOADPATH")
            .expect("UPLOADPATH should be set in .env file"),
    );

    migrate_database(&db_pool).await;
    get_server(listener, db_pool, upload_dir)?.await
}
