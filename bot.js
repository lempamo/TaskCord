const Discord = require('discord.js');
const fs = require('fs');
const client = new Discord.Client();
const api = require('./api.js');

var obj = {};
fs.readFile("taskfile.json", function (err, text) {
    obj = JSON.parse(text);
});
var taskstates = {};

client.on('message', function(message) {
    var msg = message.content;

    if (message.guild != null) {
        if (msg.toLowerCase().startsWith("task:")) {
            var args = msg.split(" ");

            switch (args[0]) {
                case "task:setchannel":
                    if (args.length > 1) {
                        if (message.member.permissions.has('ADMINISTRATOR')) {
                            var chan = args[1].substr(2).replace(">", "");
                            if (message.guild.channels.find("id", chan)) {
                                obj[message.guild.id]["channel"] = chan;
                                fs.writeFile('taskfile.json', JSON.stringify(obj));
                                message.reply("the channel I post tasks in has been changed to " + args[1] + "!");
                            } else {
                                message.reply("that is an invalid channel!");
                            }
                        } else {
                            message.reply("you aren't allowed to change what channel I post in!")
                        }
                    } else {
                        message.reply("please enter a channel that I can post in.");
                    }
                    break;
                case "task:add":
                    if (message.member.roles.find("name", "Task Lord")) {
                        if (!taskstates[message.author.id]) {
                            taskstates[message.author.id] = {};
                            taskstates[message.author.id].state = 1;
                            taskstates[message.author.id].guild = message.guild.id;
                            message.reply(":arrow_left: Continue in DMs.");
                            message.author.send("**TASK ADDER 7000**\n" +
                                "Here's how this will work.\n\n" +
                                "- You will be guided through the process of adding a task.\n" +
                                "- Just respond to my prompts by typing a message in this DM and sending it.\n" +
                                "- At any time, you may type \"q\" to quit.\n\n" +
                                "Respond with 'y' if you understand.");
                        } else {
                            message.reply("you are already trying to add a task!");
                        }
                    } else {
                        message.reply("you aren't allowed to add tasks!");
                    }
                    break;
                case "task:testchannel":
                    var c = client.channels.get(obj[message.guild.id]["channel"]);
                    c.send('test')
                        .then(message => console.log(`Sent message: ${message.content}`))
                        .catch(console.error);
                    break;
                case "task:help":
                    message.channel.send("**Here's a list of commands:**\n"+
                                        "`task:setchannel <channel>`: Set the channel where tasks are posted.\n"+
                                        "`task:add`: Go through process in DMs to add a task.")
                    break;
                default:
                    message.reply("Invalid command. Type 'task:help' to see a list of commands.");
            }
        }
    } else {
        if (taskstates[message.author.id] != null) {
            var state = taskstates[message.author.id];
            if (state.lastEmbed != null) {
                state.lastEmbed.delete();
                state.lastEmbed = null;
            }

            if (message.content.toLowerCase() == "q") {
                var embed = new Discord.RichEmbed("test");
                embed.setAuthor("[CANCELLED]");
                embed.setColor("#FF0000");
                embed.setDescription("\u200B");
                
                var title;
                if (state.title == null) {
                    title = "~~Title~~";
                } else {
                    title = "~~" + state.title + "~~";
                }

                var task;
                if (state.task == null) {
                    task = "~~Task~~";
                } else {
                    task = "~~" + state.Task + "~~";
                }

                embed.addField(title, Task);
                
                message.author.sendEmbed(embed);
                
                message.author.send(":octagonal_sign: Task process cancelled.");
                state = null;
            } else {
                switch (state.state) {
                    case 1: //Welcome to the Task tool
                        if (message.content.toLowerCase() == "y") {
                            //Continue
                            state.state = 2;
                            
                            var embed = new Discord.RichEmbed("test");
                            embed.setAuthor(client.guilds.get(state.guild).name + " #" + (obj[state.guild].tasks.length + 1).toString());
                            embed.setColor("#008080");
                            
                            embed.addField("__Title__\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_", "Task");
                            
                            embed.setFooter("User ID: " + message.author.id);
                            message.author.sendEmbed(embed).then(function(message) {
                                state.lastEmbed = message;
                            });
                            
                            message.author.send("What's the name of this task?");
                        } else {
                            //Abort
                            message.author.send(":octagonal_sign: Task process cancelled.");
                            state = null;
                        }
                        break;
                    case 2: //Title
                        state.title = message.content;
                        state.state = 3;
                        
                        var embed = new Discord.RichEmbed("test");
                        embed.setAuthor(client.guilds.get(state.guild).name + " #" + (obj[state.guild].tasks.length + 1).toString());
                        embed.setColor("#008080");
                        
                        embed.addField(state.title, "__Task__\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_\\_");
                        
                        message.author.sendEmbed(embed).then(function(message) {
                            state.lastEmbed = message;
                        });
                    
                        message.author.send("Can you describe your task? If you don't want to, reply with a `.`");
                        break;
                    case 3: //Task
                        if (message.content.length > 1000) {
                            message.author.send(":no_entry_sign: Your response needs to be 1000 characters or less.");
                        } else if (message.content == "."){
                            state.task = "";
                            state.state = 4;

                            var embed = new Discord.RichEmbed("test");
                            embed.setAuthor(client.guilds.get(state.guild).name + " #" + (obj[state.guild].tasks.length + 1).toString());
                            embed.setColor("#008080");
                            
                            embed.addField(state.title, state.task);
                            
                            message.author.sendEmbed(embed).then(function(message) {
                                state.lastEmbed = message;
                            });

                            message.author.send("Ready to submit this task?");
                        } else {
                            state.task = message.content;
                            state.state = 4;

                            var embed = new Discord.RichEmbed("test");
                            embed.setAuthor(client.guilds.get(state.guild).name + " #" + (obj[state.guild].tasks.length + 1).toString());
                            embed.setColor("#008080");
                            
                            embed.addField(state.title, state.task);
                            
                            message.author.sendEmbed(embed).then(function(message) {
                                state.lastEmbed = message;
                            });

                            message.author.send("Ready to submit this task?");
                        }
                        break;
                    case 4: //Confirm
                        if (message.content.toLowerCase().startsWith("y")) {
                            //Submit
                            var embed = new Discord.RichEmbed("test");
                            embed.setAuthor(client.guilds.get(state.guild).name + " #" + (obj[state.guild].tasks.length + 1).toString(), client.guilds.get(state.guild).iconURL);
                            embed.setColor("#008080");
                            
                            embed.addField(state.title, state.task);
                            embed.addField("STATUS", "Open", true);
                            
                            embed.setFooter("Submitted by " + message.author.tag + " at " + new Date().toUTCString());

                            var channel = client.channels.get(obj[state.guild].channel);
                            
                            channel.sendEmbed(embed).then(function (message) {
                                obj[state.guild]["tasks"][obj[state.guild]["tasks"].length] = {"name": state.title, "desc": state.task, "submitter": message.author.id, "date": new Date().toUTCString(), "status": "Open", "id": message.id};
                                fs.writeFile('taskfile.json', JSON.stringify(obj));
                                state = null;
                            });
                            message.author.send(":white_check_mark: OK: Your task has been listed.");
                        } else {
                            message.author.send("Sorry, I didn't quite get that. Respond with `yes` or `q`.");
                        }
                        break;
                }
            }
            taskstates[message.author.id] = state;
        }
    }
});

client.on('guildCreate', function (guild) {
    obj[guild.id] = {};
    fs.writeFile('taskfile.json', JSON.stringify(obj));
});

client.login(api.token).catch(function() {
    console.log("[ERROR] Login failed.");
});
