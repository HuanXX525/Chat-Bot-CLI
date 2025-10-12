# chat-bot-cli

A CLI chat bot with an interactive terminal interface similar to iFlow.

## Features

- Interactive chat interface in the terminal
- Scrollable chat history
- Command support (/help, /clear, /exit)
- Responsive design that adapts to terminal size

## Install

```bash
$ npm install --global chat-bot-cli
```

## CLI

```
$ chat-bot-cli --help

  Usage
    $ chat-bot-cli

  Options
    --name  Your name

  Examples
    $ chat-bot-cli --name=Jane
    Hello, Jane
```

## Usage

Run the chat bot:

```bash
$ chat-bot-cli
```

Once running, you can:

- Type messages and press Enter to send
- Use ↑/↓ arrow keys to scroll through chat history
- Type /help to see available commands
- Type /clear to clear chat history
- Type /exit or press ESC to quit

## Terminal Compatibility

This application requires a terminal that supports raw mode for interactive features. If you encounter an error about raw mode not being supported, please try one of these terminals:

- **Windows**: Windows Terminal (recommended), Git Bash, PowerShell
- **Mac**: iTerm2 (recommended), Terminal
- **Linux**: Most modern terminal emulators

If you're using CMD on Windows, we recommend switching to Windows Terminal for the best experience.
