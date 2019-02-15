class Context {
    constructor(sosamba, msg) {
        this.sosamba = sosamba;
        this.guild = msg.channel.guild;
        this.channel = msg.channel;
        this.author = msg.author;
        this.member = msg.member;
        this.message = msg;
    }

    /**
     * Allows sending messages that are editable when the text is edited
     * @param  {...any} args Anything that you'd normally pass to the TextChannel.createMessage function
     */
    async send(content, file) {
        // Sorry for commiting a sin, but we create a new context each time, thus a context isn't the most permanent method of storing anything
        if (this.message._responseMsg) {
            if (file) {
                // Unfortunately
                await this.message._responseMsg.delete();
                return this.message._responseMsg = await this.channel.createMessage(content, file);
            } else {
                return await this.message._responseMsg.edit(content);
            }
        } else {
            return this.message._responseMsg = await this.channel.createMessage(content, file);
        }
    }
}
module.exports = Context;