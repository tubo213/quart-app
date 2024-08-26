use quart_engine::game::Game;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn initialize_game() -> String {
    let game = Game::new();
    game.to_json()
}
