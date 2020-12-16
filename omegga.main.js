const discord = require("discord.js");
const path = require('path');
const fs = require('fs');

const emojis = ["🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🍈","🍒","🍑","🍍","🥝","🥑","🍅","🍆","🥒","🥕","🌽","🌶","🥔","🍠","🌰","🥜","🍯","🥐","🍞","🥖","🧀","🥚","🍳","🥓","🥞","🍤","🍗","🍖","🍕","🌭","🍔","🍟","🥙","🌮","🌯","🥗","🥘","🍝","🍜","🍲","🍥","🍣","🍱","🍛","🍙","🍚","🍘","🍢","🍡","🍧","🍨","🍦","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🥛","🍼","☕","🍵","🍶","🍺","🍻","🥂","🍷","🥃","🍸","🍹","🍾","🥄","🍴","🍽","🚗","🚕","🚙","🚌","🚎","🏎️","🚑","🚓","🚒","🚐","🚚","🚛","🚜","🛺","🛵","🏍️","🛴","🚲","🦼","🦽","🚔","🚨","🚍","🚘","🚖","🚡","🚠","🚟","🚃","🚋","🚞","🚝","🚄","🚅","🚈","🚂","🚆","🚇","🚊","🚉","✈️","🛫","🛬","🛩️","💺","🚀","🛰️","🛸","🚁","🔴","🔵","🟤","🟣","🟢","🟡","🟠","⚪","⚫","⬛","⬜","🟧","🟦","🟥","🟫","🟪","🟩","🟨"];

class Discord {
  constructor(omegga, config) {
    this.omegga = omegga;
    if (!this.omegga.playerEmojis) {
      this.omegga.playerEmojis = {}
    }
    this.date = {};
    this.client = null;
    this.channel = null;
    try {
      this.config = JSON.parse(fs.readFileSync(path.resolve(__dirname, './config.json')));
    } catch(e) {
      this.config = {};
      console.error('Plugin config file can not be read.');
    }
  }

  init() {
    this.client = new discord.Client();

    this.client.on('ready', () => {
      try {
        console.log(`Logged in as ${this.client.user.tag}!`);
        this.channel = this.client.channels.cache.get(this.config.channel)
        this.client.user.setActivity(this.config.status, { type: 'WATCHING' })
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
      .on('chat', (name, message) => {
        try {
          // if (name === 'Marble') {
          //   this.omegga.broadcast(`test`)
          // }
          this.channel.send(`${this.omegga.playerEmojis[name]}  **${name}**: ${message}`);
        } catch (error) {
          console.error(error);
        }
      })
      .on('join', (player) => {
        try {
          const sender = player.name;
          if (sender === 'Aware') {
            this.omegga.playerEmojis[sender] = '🧇';
          } else if (sender === 'Ghille') {
            this.omegga.playerEmojis[sender] = '<:coolmanbones:754224617429794836>';
          } else if (sender === 'rlcbm') {
            this.omegga.playerEmojis[sender] = '🕑';
          } else if (sender === 'cake') {
            this.omegga.playerEmojis[sender] = '<:notcake:760548640040419348>';
          } else if (sender === 'Facechild') {
            this.omegga.playerEmojis[sender] = '<:Facechild:760549906611306568>';
          } else if (sender === 'Shepshiherset') {
            this.omegga.playerEmojis[sender] = '<:goblin:761802645714501643>';
          } else if (sender === 'Dessert') {
            this.omegga.playerEmojis[sender] = '<:DessertSource:761832474565017611>';
          } else if (sender === 'Skweaver') {
            this.omegga.playerEmojis[sender] = '<:Skweaver:761851966543888415>';
          }
          if (!this.omegga.playerEmojis[sender]) {
            this.omegga.playerEmojis[sender] = emojis[Math.floor(Math.random() * emojis.length)];
          }
          this.channel.send(`${this.omegga.playerEmojis[sender]}  **${sender}** has joined the game.`);
        } catch (error) {
          console.error(error);
        }
      })
      .on('leave', (player) => {
        try {
          const sender = player.name;
          this.channel.send(`${this.omegga.playerEmojis[sender]}  **${sender}** has left the game.`);
        } catch (error) {
          console.error(error);
        }
      });
  }

  parseLinks(message) {
    const regex = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    return message.replace(regex, '<link="$1">$1</>');
  }

  stop() {
    this.omegga
      .removeAllListeners('start')
      .removeAllListeners('join')
      .removeAllListeners('chat')
      .removeAllListeners('leave')

    if(this.client) {
      this.client.destroy();
      this.client = null;
    }
    this.channel = null;
  }
}

module.exports = Discord;