'use strict'
require('dotenv').config()

const {Client,LocalAuth} = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal');
const {generateMessage} = require('../helper/generate.js')
const { createLogs } = require('../helper/funcTable.js');

const client = new Client({
  authStrategy: new LocalAuth({clientId: process.env.SECRET}),
    puppeteer: {
      headless: true, 
      args: [
        '--no-sanbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-extensions'],
    }
})

exports.adminId = async ()=>{

  if (!client || !client.info){

    client.on('qr', (qr) => {
      qrcode.generate(qr,{small : true})
    })

    client.on('ready', () => {
      console.log('WhatsApp client is ready!')
    })
    
    client.on('authenticated', () => {
      console.log('Client authenticated successfully!')
    })

    client.on('message_create',async (val)=>{
      if (val !== null){
        let _exists = await client.getChats()
        let _vE = _exists.find(f=> f.id._serialized === val.from)
        
        if (_vE){
          let _y = ['1','2','3','4','5','6']
          if (val.type === 'chat' && val?.body){
            if (!_y.includes(val?.body)) await _vE.lastMessage.reply(await generateMessage(null,'contact admin'))
          }
          if (val.hasMedia || val.links.length > 0 ) 
          {
            await val.reply('Please not send media or links.!')
            await val.delete()
          }
        }else{
          await val.reply(await generateMessage(null,'contact admin'))
        }
        return
      }
    })
    // client.on('disconnected', async  (reason) => {
    //   console.log('Client disconnected:', reason)
    //   await client.destroy()
    //   client = null
    // })

    await client.initialize()
  }
}

exports._wwebJSService = async (data,isType)=>{
  
  if (isType == 'sendToAdmin') {
      let user    = data?.dataValues?.users?.dataValues
      if (!user?.phone_number){
        await createLogs('LogMessage',{ponumber : data.ponumber, messages : 'Your phone not found'})
        return 'Your phone not found'
      } 
      if (user?.phone_number.toString().startsWith('08')) 
      {
        await createLogs('LogMessage',{ponumber : data.ponumber, messages : 'Invalid formated phone number'})
        return 'Your phone not found'
      }

      if (user?.phone_number.toString().length <= 10) {
        {
          await createLogs('LogMessage',{ponumber : data.ponumber, messages : 'Phone number invalid'})
          return 'Your phone not found'
        }
      }
      await client.sendMessage(`${user?.phone_number}@c.us`, await generateMessage(data,'admin'));
      return true
  }
  else {
  
  }

}


