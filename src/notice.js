import Push from 'push.js';

const notice = {
    enabled: () => {
        return Push.Permission.has();
    },

    enable: function () {
        Push.create("Notifications enabled!")
            .catch(e => {
                console.log('denied!');
            });
    },

    push: function (title, messageString, icon) {
        if (this.enabled()) {
            console.log(icon);
            Push.create(title, {
                body: messageString,
                icon: icon
            });
        }
    }
}

export { notice };