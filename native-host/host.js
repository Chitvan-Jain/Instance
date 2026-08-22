let inputBuffer = Buffer.alloc(0)

function sendMessage(message) {
  const json = Buffer.from(JSON.stringify(message), 'utf-8')
  const header = Buffer.alloc(4)
  header.writeUInt32LE(json.length, 0)
  process.stdout.write(Buffer.concat([header, json]))
}

function handleMessage(message) {
  if (message.type === 'ping') {
    sendMessage({ type: 'pong', receivedAt: new Date().toISOString() })
  }
}

process.stdin.on('data', (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk])

  while (inputBuffer.length >= 4) {
    const messageLength = inputBuffer.readUInt32LE(0)
    if (inputBuffer.length < 4 + messageLength) break // wait for the rest to arrive

    const messageBytes = inputBuffer.subarray(4, 4 + messageLength)
    inputBuffer = inputBuffer.subarray(4 + messageLength)

    handleMessage(JSON.parse(messageBytes.toString('utf-8')))
  }
})