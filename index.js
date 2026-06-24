const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize WhatsApp Client
const client = new Client({
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// 1. QR Code generate karne ke liye
client.on('qr', (qr) => {
    console.log('--- NEECHE WALE QR CODE KO APNE SPARE WHATSAPP SE SCAN KAREIN ---');
    qrcode.generate(qr, { small: true });
});

// 2. Jab Bot successfully login ho jaye
client.on('ready', () => {
    console.log('Alpha Surveillance Bot Active Aur Ready Hai! 😎');
});

// 3. Main Logic: Message aane par kya karna hai
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();

        // ⚠️ YAHAAN APNE GROUPS KE EXACT NAAM LIKHO ⚠️
        const sourceGroupName = "Best one store PK"; // Jahan se video uthani hai
        const clientGroupName = "Best One ALPHA Surveillance"; // Jahan forward karni hai

        // Check karo agar message tumhare 'Source Group' se aaya hai aur usme video/media hai
        if (chat.isGroup && chat.name === sourceGroupName && msg.hasMedia) {

            console.log(`New update detected in ${sourceGroupName}. Downloading video...`);

            // Video download karo background mein
            const media = await msg.downloadMedia();

            // Ab saari chats dhoondo taake Client Group mil sake
            const allChats = await client.getChats();
            const targetChat = allChats.find(c => c.isGroup && c.name === clientGroupName);

            if (targetChat) {
                // Video ko caption ke sath forward karo
                await client.sendMessage(targetChat.id._serialized, media, { 
                    caption: msg.body || msg.caption || "" 
                });
                
                console.log(`✅ Video successfully forward kar di gayi hai: ${clientGroupName}`);
                

            } else {
                console.log(`❌ Error: '${clientGroupName}' waala group nahi mila. Check karein ke bot us group mein add hai ya nahi.`);
            }
        }
    } catch (error) {
        console.error("Bot mein koi masla aaya hai:", error);
    }
});

// Bot ko start karo
client.initialize();