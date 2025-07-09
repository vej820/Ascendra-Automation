import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis';
import he from 'he'; // Used to decode HTML entities
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';
const OUTPUT_PATH = path.join(__dirname, 'utils', 'latest-user.json');

export async function getLatestEmail() {
  const auth = await authorize();
  const gmail = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.list({
    userId: 'me',
    maxResults: 5,
    q: 'from:noreply@ascendrainternational.ai subject:"Welcome! Your Account is Now Active"',
    labelIds: ['INBOX'],
  });

  if (!res.data.messages || res.data.messages.length === 0) {
    console.log('❌ No matching messages found.');
    return null;
  }

  const messageId = res.data.messages[0].id;
  if (!messageId) return null;

  const messageRes = await gmail.users.messages.get({ userId: 'me', id: messageId });
  const payload = messageRes.data.payload;

  let encodedBody = '';

  if (payload && payload.parts && Array.isArray(payload.parts)) {
    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
    encodedBody = htmlPart?.body?.data || '';
  } else if (payload && payload.body) {
    encodedBody = payload.body?.data || '';
  }

  if (!encodedBody) {
    console.log('⚠️ No HTML body found');
    return null;
  }

  // Decode base64 + HTML entities
  const html = he.decode(Buffer.from(encodedBody, 'base64').toString('utf-8'));

  const username = html.match(/<strong>username:<\/strong>\s*([^<]+)/i)?.[1]?.trim();
  const password = html.match(/<strong>password:<\/strong>\s*([^<]+)/i)?.[1]?.trim();

  if (!username || !password) {
    console.log('❌ Failed to extract credentials.');
    return null;
  }

  console.log('✅ Extracted credentials:', { username, password });

  // Save to latest-user.json
  const userData = [{ email: username, password, sponsorCode: '' }];
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(userData, null, 2));
  console.log(`📁 Saved to ${OUTPUT_PATH}`);

  return { username, password };
}

function authorize(): Promise<any> {
  const credentials = JSON.parse(fs.readFileSync('credentials.json', 'utf-8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    return Promise.resolve(oAuth2Client);
  }

  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Authorize this app by visiting this URL:\n', authUrl);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err || !token) return reject(err || new Error('Token not returned'));
        oAuth2Client.setCredentials(token);
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        resolve(oAuth2Client);
      });
    });
  });
}
