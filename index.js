const { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } = require('discord-akairo');
const config = require('./config.json');
const pg = require('pg');

require('./structures/message.js');

class MyClient extends AkairoClient {
  constructor() {
    super({
      // Options for Akairo go here
      ownerID: ['167988857046827010', '575448221577641989']
    }, {
      // Options for discord.js go here
      disableEveryone: true,
      presence: { activity: { name: '@YggyBot help', type: 'PLAYING'} }
    });

    this.commandHandler = new CommandHandler(this, {
    // Options for command handler go here
      directory: './commands/',
      allowMention: true,
      prefix: message => {
        if (message.guild) {
          return this.guildSettings.get(message.guild.id).prefix
        }
        return ';'
      }
    });

    this.inhibitorHandler = new InhibitorHandler(this, {
      // Options for inhibitor handler go here
      directory: './inhibitors/'
    });

    this.listenerHandler = new ListenerHandler(this, {
      // Options for listener handler go here
      directory: './listeners/'
    });

    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler
    });

    this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.commandHandler.loadAll();
    this.inhibitorHandler.loadAll();
    this.listenerHandler.loadAll();
  }
}

const client = new MyClient();

const db = new pg.Pool({
  user: config.pguser,
  host: config.pgserv,
  database: config.pgdb,
  password: config.pgpass,
  port: config.pgport
})

db.connect(err => {
  if (err) return console.error('Could not connect to database', err);
});

client.db = db;

require('./modules/functions.js')(client);
require('./modules/combat.js')(client);
require('./modules/gather.js')(client);

client.login(config.token);