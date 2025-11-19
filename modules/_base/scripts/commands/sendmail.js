function parseMailParams(params) {
    const RECIPIENT_SEPARATOR = ',';
    const recipientStringList = [];
    let topic = '';
    const body = [];
    let bParsingRecipients = true;
    let bTopicParsed = false;
    for (let i = 0, l = params.length; i < l; ++i) {
        const param = params[i].trim();
        if (bParsingRecipients) {
            if (param === RECIPIENT_SEPARATOR) {
                continue;
            }
            recipientStringList.push(...param.split(RECIPIENT_SEPARATOR));
            if (param.includes(RECIPIENT_SEPARATOR)) {
                continue;
            }
            bParsingRecipients = false;
        } else if (!bTopicParsed) {
            topic = param;
            bTopicParsed = true;
        } else {
            body.push(param);
        }
    }
    return {
        recipients: recipientStringList
            .join(RECIPIENT_SEPARATOR)
            .replace(/\s/g, '')
            .split(RECIPIENT_SEPARATOR)
            .filter((rcpt) => rcpt !== ''),
        topic,
        body: body.join(' '),
    };
}

/**
 * Mail messaging system
 * This command sends a message to another user, even if the recipient not online
 * @param ctx {IClientContext}
 * @param parameters {string[]}
 */
function sendMail(ctx, parameters) {
    // 1) analyse parameters
    // 2) extract recipient
    // 3) test recipient existence
    // syntax 1
    // sendmail recipient "topic" message
    // syntax 2
    // sendmail recipient1, recipient2, recipient3 "topic topic" this is the message content.
    const { recipients, topic, body } = parseMailParams(parameters);
    // convert recipient list to array of user ids

    return true;
}

module.exports = sendMail(context, parameters);
