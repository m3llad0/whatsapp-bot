const {Client, List} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const {default: ora} = import('ora');
const {default: chalk} = import('chalk');
const fs = require('fs');

let client;
let sessionData;

const SESSION_PATH_FILE = './session.json';

const withSession = () =>
{
    const spinner = ora(`Loading... ${chalk.red('Validating WhatsApp data...')}`);
    sessionData = require(SESSION_PATH_FILE);
    spinner.start();
    client = new Client(
        {
            session:sessionData
        });

    client.on('ready', () =>
    {
        console.log('Client is ready!');
        spinner.stop();
    });

    client.on('auth_failure', () => 
    {
        console.log('Authentication error')
    });

    client.initialize();
}

const withOutSession = () =>
{
    console.log('No previous session');

    let clientid = "client" + Math.floor(Math.random() * 100).toString();

    client = new Client();
    // ({
        // authStrategy: new LocalAuth({
        //     clientId: clientid,
        //     session: sessionData
        // })
    // });

    client.on('ready', () =>
    {
        console.log('Client is ready!')
        listenMessage();
    });

    client.on('qr', qr =>
    {
        qrcode.generate(qr, {small : true});
    });

    // client.on('authenticated', (session) => {
    // sessionData = session;
    // fs.writeFile(SESSION_PATH_FILE, JSON.stringify(session), (err) => {
    //     if (err) {
    //         console.error(err);
    //     }
    //     });
    // });

    client.initialize();
}

/**
 * This function listen for new messages
 */
const listenMessage = () =>{
    client.on('message', (msg) =>
    {
        const {from, to, body} = msg;

        console.log(from, to, body);
        if(body.toLowerCase() == 'hola')
        {
            const productsList = new List(
                //Body
                "Here's our list of products at 50% off",
                //Button to see the list
                "View all products",
                [
                  {
                    //Title of the list
                    title: "Products list",
                    //Array
                    rows: [
                      { id: "apple", title: "Apple" },
                      { id: "mango", title: "Mango" },
                      { id: "banana", title: "Banana" },
                    ],
                  },
                ],
                //title of the list
                "Please select a product"
            ); 
            sendMessage(from, productsList);
        }
        

    });
}

const sendMessage = (to, message) =>
{
    client.sendMessage(to, message);
    console.log('Message sent');
}

(fs.existsSync(SESSION_PATH_FILE)) ? withSession() : withOutSession();
