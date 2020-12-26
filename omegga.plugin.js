const discord = require("discord.js");

const allEmojis = ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍈","🍒","🍑","🍍","🥝","🥑","🍅","🍆","🥒","🥕","🌽","🌶","🥔","🍠","🌰","🥜","🍯","🥐","🍞","🥖","🧀","🥚","🍳","🥓","🥞","🍤","🍗","🍖","🍕","🌭","🍔","🍟","🥙","🌮","🌯","🥗","🥘","🍝","🍜","🍲","🍥","🍣","🍱","🍛","🍙","🍚","🍘","🍢","🍡","🍧","🍨","🍦","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🥛","🍼","☕","🍵","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🍾","🥄","🍴","🍽","🚗","🚕","🚙","🚌","🚎","🏎️","🚑","🚓","🚒","🚐","🚚","🚛","🚜","🛺","🛵","🏍️","🛴","🚲","🦼","🦽","🚔","🚨","🚍","🚘","🚖","🚡","🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","✈️","🛫","🛬","🛩️","💺","🚀","🛰️","🛸","🚁","🔴","🔵","🟤","🟣","🟢","🟡","🟠","⚪","⚫","⬛","⬜","🟧","🟦","🟥","🟫","🟪","🟩","🟨"];

class Discord {
  constructor(omegga, config, store) {
    this.omegga = omegga;
    this.config = config;
    this.store = store;

    this.date = {};
    this.client = null;
    this.channel = null;
    this.emojis = {};
    this.store.get('emojis').then((emojis) => {
      if (emojis) {
        this.emojis = emojis
      } else {
        this.emojis = {}
      }
    }) 
  }

  init() {
    if (!this.config.token) {
      console.error('Missing Discord Token')
      return;
    }
    if (!this.config.channel) {
      console.error('Missing Discord Channel ID')
      return;
    }

    this.client = new discord.Client();

    this.client.on('ready', () => {
      try {
        console.log(`Logged in as ${this.client.user.tag}!`);
        this.channel = this.client.channels.cache.get(this.config.channel)
        if (this.config.status) {
          this.client.user.setActivity(this.config.status, { type: 'WATCHING' })
        }
      } catch(error) {
        console.error(error);
      }
      
    });
    
    this.client.on('message', msg => {
      try {
        if (msg.author.id === this.client.user.id) {
          return;
        }
      
        if (msg.channel.id === this.channel.id) {
          const sender = msg.author.username;
          const content = msg.content.slice(0, 256);
          let message = content.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
          message = this.parseLinks(message);
          this.omegga.broadcast(`<emoji>orb</><color="8B5959"><b>${sender}</></>: ${message}`)
        }
      } catch(error) {
        console.error(error);
      }
    });

    try {
      this.client.login(this.config.token);
    } catch (error) {
      console.error(error);
    }

    this.omegga
      .on('chat', this.chat)
      .on('join', this.join)
      .on('leave', this.leave)
      .on('chatcmd:setemoji', this.setEmoji)
      .on('chatcmd:resetemoji', this.resetEmoji)
  }

  resetEmoji = (senderName, name) => {
    this.setEmoji(senderName, name, '')
  }

  setEmoji = (senderName, name, emoji) => {
    const access = this.omegga.getPlayer(senderName).isHost() || this.config.access.split(',').includes(senderName);
    if (access) {
      const newEmojis = { ...this.emojis, [name]: emoji }
      this.emojis = newEmojis;
      this.store.set('emojis', newEmojis);
    }
  }

  chat = async (name, message) => {
    try {
      this.channel.send(`${this.getEmoji(name)}  **${name}**: ${message}`);
    } catch (error) {
      console.error(error);
    }
  }

  join = async (player) => {
    try {
      const name = player.name;
      this.channel.send(`${this.getEmoji(name)}  **${name}** has joined the game.`);
    } catch (error) {
      console.error(error);
    }
  }

  getEmoji(name) {
    const emojis = this.emojis;
    
    if (emojis[name]) {
      return emojis[name];
    } else {
      const emoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
      const newEmojis = { ...emojis, [name]: emoji }
      this.emojis = newEmojis;
      this.store.set('emojis', newEmojis);
      return emoji;
    }
  }

  leave = (player) => {
    try {
      const name = player.name;
      this.channel.send(`${this.getEmoji(name)}  **${name}** has left the game.`);
    } catch (error) {
      console.error(error);
    }
  }

  parseLinks(message) {
    const regex = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    return message.replace(regex, '<link="$1">$1</>');
  }

  stop() {
    this.omegga
      .removeListener('join', this.join)
      .removeListener('chat', this.chat)
      .removeListener('leave', this.leave)
      .removeListener('chatcmd:setemoji', this.setEmoji)
      .removeListener('chatcmd:resetemoji', this.resetEmoji)

    if(this.client) {
      this.client.destroy();
      this.client = null;
    }
    this.channel = null;
  }
}

module.exports = Discord;