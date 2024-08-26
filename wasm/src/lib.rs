use quart_engine::game::player::Player;
use quart_engine::game::Game;
use quart_engine::policies::policy::Policy;
use quart_engine::policies::random_policy::RandomPolicy;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct WebRunner {
    game: Game,
    policy: RandomPolicy,
}

#[wasm_bindgen]
impl WebRunner {
    #[wasm_bindgen(constructor)]
    pub fn new() -> WebRunner {
        WebRunner {
            game: Game::new(),
            policy: RandomPolicy::new(),
        }
    }

    pub fn reset(&mut self) {
        self.game = Game::new();
        self.policy = RandomPolicy::new();
    }

    pub fn fetch_policy_action(&mut self) -> String {
        let action = self.policy.action(&self.game);
        serde_json::to_string(&action).unwrap()
    }

    pub fn fetch_game_state(&self) -> String {
        serde_json::to_string(&self.game).unwrap().clone()
    }

    pub fn fetch_available_piece(&self) -> String {
        serde_json::to_string(&self.game.available_pieces).unwrap()
    }

    pub fn play_turn(&mut self, row: usize, col: usize, piece_index: Option<usize>) {
        if let Err(err) = self.game.play_turn(row, col, piece_index) {
            wasm_bindgen::throw_str(&format!("Error during play_turn: {}", err));
        }
    }

    pub fn is_game_over(&self) -> bool {
        self.game.is_game_over()
    }

    pub fn judge_winner(&self, player_first: bool) -> String {
        let winner = self.game.judge_winner();
        if winner.is_none() {
            "Draw".to_string()
        } else if matches!(winner.unwrap(), Player::Player1) && player_first {
            "あなた".to_string()
        } else if matches!(winner.unwrap(), Player::Player2) && player_first {
            "AI".to_string()
        } else if matches!(winner.unwrap(), Player::Player1) && !player_first {
            "AI".to_string()
        } else {
            "あなた".to_string()
        }
    }
}
