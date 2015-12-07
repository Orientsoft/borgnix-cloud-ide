import Client from 'arduino-compiler/lib/client'

describe('arduino', () => {
  it('should get a client', () => {
    let client = new Client({host: 'o'})
    console.log(client)
  })
})
