Telegram bot: [@fluence_selectors_bot](https://t.me/fluence_selectors_bot)

## Run
`npm run dev`

## Add ABI
There are Foundry artifacts in `src/abi` directory. You can add (just copy files there), the bot recursively gets all ABI data

## Commands
1) Function selector like `a9059cbb` or `0xa9059cbb`
2) Event selector like `0x0431ea4d93af299b92f2c606ddcaf4b31cb0013c5ed1fdea837b8a912347c965`
3) Error selector or error data like `0x5416eb988da5cb5b00000000000000000000000000000000000000000000000000000000`
4) Full calldata to decode like `0x0af76b8f0000000000000000000000003d441ee4a0b65d8e3fe939b7b632152837be73fe0000000000000000000000000000000000000000000000056bc75e2d63100000`
5) Private or public keys to get address, in any format like `03...` or `04...` or `Amg7rBBsVeGC/Ufd6gsgD8Jqc7nHV8epXKFmu1XORo2/`

## Bot welcome text
```
Welcome to the Fluence ABI Bot!
The bot is loaded with Fluence and IPC ABI data and can help you with function signatures, event signatures, error signatures, and decoding calldata.

ℹ️ Send me a message with a function selector to get the function signature.
0xa9059cbb

ℹ️ Send me a message with an event selector to get the event signature.
0x0431ea4d93af299b92f2c606ddcaf4b31cb0013c5ed1fdea837b8a912347c965

ℹ️ Send me a message with an error selector or full error data to get the error signature.
0x5416eb988da5cb5b00000000000000000000000000000000000000000000000000000000

ℹ️ Send me a message with calldata to get the function signature and decoded calldata.
0x0af76b8f0000000000000000000000003d441ee4a0b65d8e3fe939b7b632152837be73fe0000000000000000000000000000000000000000000000056bc75e2d63100000

ℹ️ Send me private or public key in any format (hex like in EVM or base64 from IPC) to get the address.
Amg7rBBsVeGC/Ufd6gsgD8Jqc7nHV8epXKFmu1XORo2/
```
