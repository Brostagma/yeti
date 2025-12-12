use enigo::{Enigo, Key, KeyboardControllable, MouseControllable};
use serde::{Deserialize, Serialize};
use std::io::{self, BufRead};

#[derive(Serialize, Deserialize, Debug)]
#[serde(tag = "type", content = "payload")]
enum Command {
    MouseMove { x: i32, y: i32 },
    MouseClick { button: String }, // "left", "right", "middle"
    KeyPress { key: String },
    KeyClick { key: String },
    Scroll { x: i32, y: i32 },
}

fn main() {
    let mut enigo = Enigo::new();
    let stdin = io::stdin();
    
    // Read commands from stdin line by line
    for line in stdin.lock().lines() {
        if let Ok(input) = line {
            if let Ok(command) = serde_json::from_str::<Command>(&input) {
                match command {
                    Command::MouseMove { x, y } => {
                        enigo.mouse_move_to(x, y);
                    }
                    Command::MouseClick { button } => {
                        match button.as_str() {
                            "left" => enigo.mouse_click(enigo::MouseButton::Left),
                            "right" => enigo.mouse_click(enigo::MouseButton::Right),
                            "middle" => enigo.mouse_click(enigo::MouseButton::Middle),
                            _ => {}
                        }
                    }
                    Command::KeyPress { key } => {
                        // Simplified key handling for demo
                        enigo.key_down(Key::Layout(key.chars().next().unwrap_or('a')));
                    }
                    Command::KeyClick { key } => {
                         enigo.key_click(Key::Layout(key.chars().next().unwrap_or('a')));
                    }
                    Command::Scroll { x: _, y } => {
                        enigo.mouse_scroll_y(y);
                    }
                }
            } else {
                eprintln!("Failed to parse command: {}", input);
            }
        }
    }
}
