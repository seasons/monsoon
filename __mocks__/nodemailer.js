class NodemailerMock {
  createTransport = () => ({
    sendMail: () => null,
  })
}

module.exports = new NodemailerMock()
