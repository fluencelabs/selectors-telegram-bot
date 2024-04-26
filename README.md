Telegram bot: [@fluence_selectors_bot](https://t.me/fluence_selectors_bot)

Bot tries to parse incoming text via prepared selectors and decode them. Selectors are related to: 
 
- Ethereum features (addresses from private keys, other type of keys (Filecoin))
- Fluence contracts (function signatures, event signatures, error signatures, and decoding calldata)
- IPC contracts (function signatures, event signatures, error signatures, and decoding calldata)
- Fluence specific objects stored in Fluence contracts and Subgraph (e.g. PeerIds, CIDs, etc.)

To interact with the bot you send your message and await that the message could be parsed via all possible selectors for you.

## Run
Prepare .env according to [.example.env](.example.env) and run `npm run dev`

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
Bot tries to parse incoming text via prepared selectors and decode them. Selectors are related to: 
 
- Ethereum features (addresses from private keys, other type of keys (Filecoin))
- Fluence contracts (function signatures, event signatures, error signatures, and decoding calldata)
- IPC contracts (function signatures, event signatures, error signatures, and decoding calldata)
- Fluence specific objects stored in Fluence contracts and Subgraph (e.g. PeerIds, CIDs, etc.)

To interact with the bot you send your message and await that the message could be parsed via all possible selectors for you.

Examples of messages:

ℹ️ Send me a message with a function selector to get the function signature.
<code>0xa9059cbb</code>

ℹ️ Send me a message with an event selector to get the event signature.
<code>0x0431ea4d93af299b92f2c606ddcaf4b31cb0013c5ed1fdea837b8a912347c965</code>

ℹ️ Send me a message with an error selector or full error data to get the error signature.
<code>0x5416eb988da5cb5b00000000000000000000000000000000000000000000000000000000</code>

ℹ️ Send me a message with calldata to get the function signature and decoded calldata.
<code>0x0af76b8f0000000000000000000000003d441ee4a0b65d8e3fe939b7b632152837be73fe0000000000000000000000000000000000000000000000056bc75e2d63100000</code>

ℹ️ Send me private or public key in any format (hex like in EVM or base64 from IPC) to get the address.
<code>Amg7rBBsVeGC/Ufd6gsgD8Jqc7nHV8epXKFmu1XORo2/</code>

ℹ️ Send me CIDv1 to get CID in Fluence Subgraph format (yes we have special <a href="https://github.com/fluencelabs/deal/blob/main/subgraph/src/mappings/utils.ts#L37">one</a>).
<code>bafkreids22lgia5bqs63uigw4mqwhsoxvtnkpfqxqy5uwyyerrldsr32ce</code>

ℹ️ Send me PeerId (base58) to get PeerId in hex format (the format that is used in Fluence contracts as well).
<code>12D3KooWCKCeqLPSgMnDjyFsJuWqREDtKNHx1JEBiwaMXhCLNTRb</code>
```

# ToDo
- [ ] add docker
- [ ] load abi from the github directly (scheduler)
