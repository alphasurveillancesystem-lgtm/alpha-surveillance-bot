const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const mongoose = require('mongoose');
const qrcode = require('qrcode-terminal');

const MONGODB_URI = 'mongodb+srv://alphasurveillancesystem_db_user:WBhZ1ihzkzKn4edc@cluster0.9iffjqu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(() => {
    const store = new MongoStore({ mongoose: mongoose });
    const client = new Client({
        authStrategy: new RemoteAuth({
            store: store,
            backupSyncIntervalMs: 300000
        }),
        puppeteer: { args: ['--no-sandbox'] }
    });

    // 1. QR Code generate karne ke liye
   
   client.on('qr', (qr) => {
        const qrLink = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr)}`;
        console.log('--- QR CODE GENERATED ---');
        console.log('Is link ko copy karke browser mein kholein aur scan karein:');
        console.log(qrLink);
    });

    // 2. Jab Bot successfully login ho jaye
    client.on('ready', () => {
        console.log('Alpha Surveillance Bot Active Aur Ready Hai! 😎');
    });

    // 3. Main Logic: Message aane par kya karna hai
    client.on('message', async (msg) => {
        try {
            const chat = await msg.getChat();
            const sourceGroupName = "Best one store PK"; 
            const clientGroupName = "Best One ALPHA Surveillance";

            if (chat.isGroup && chat.name === sourceGroupName && msg.hasMedia) {
                console.log(`New update detected in ${sourceGroupName}. Downloading video...`);
                const media = await msg.downloadMedia();
                const allChats = await client.getChats();
                const targetChat = allChats.find(c => c.isGroup && c.name === clientGroupName);

                if (targetChat) {
                    await client.sendMessage(targetChat.id._serialized, media, { 
                        caption: msg.body || msg.caption || "" 
                    });
                    console.log(`✅ Video successfully forward kar di gayi hai: ${clientGroupName}`);
                } else {
                    console.log(`❌ Error: '${clientGroupName}' waala group nahi mila.`);
                }
            }
        } catch (error) {
            console.error("Bot mein koi masla aaya hai:", error);
        }
    });

    client.initialize();
});