use axum::extract::State;
use axum::http::StatusCode;
use axum::response::IntoResponse;
use axum::{Json, Router};
use axum::routing::get;
use serde::Serialize;
use sqlx::PgPool;

pub fn routes<S>(state: PgPool) -> Router<S> {
    Router::new()
        .route("/actors",
               get(get_actors)
                   .post(new_actor)
                   .delete(delete_actor))
        .with_state(state)
}

#[derive(Debug, Serialize)]
struct Actor {
    id: i32,
    name: String
}

async fn get_actors(State(pool): State<PgPool>) -> impl IntoResponse {
    let result = sqlx::query!("SELECT * FROM actors")
        .fetch_all(&pool)
        .await
        .map_err(internal_error);

    match result {
        Ok(result) => Ok(Json(result
            .iter()
                .map(|record| {
                    let mut name = String::from(&record.name);
                    name.push_str("rusty-rachel");

                    Actor { id: record.id, name }
                })
                .collect::<Vec<_>>()
        )),
        Err(result) => Err(result)
    }

    // if let Ok(result) = result {
    //     Ok(Json(Actors {
    //         actors: result.iter()
    //             .map(|record| Actor { id: record.id, name: String::from(&record.name) })
    //             .collect()
    //     }))
    // } else {
    //     Err(result)
    // }
}

async fn new_actor() -> impl IntoResponse {
    todo!()
}

async fn delete_actor(_: State<PgPool>) -> impl IntoResponse {
    todo!()
}


fn internal_error<E>(err: E) -> (StatusCode, String)
    where
        E: std::error::Error,
{
    (StatusCode::INTERNAL_SERVER_ERROR, err.to_string())
}