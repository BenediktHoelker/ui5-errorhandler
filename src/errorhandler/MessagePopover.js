sap.ui.define(
    [
        "sap/m/MessagePopover",
        "sap/m/library",
    ],
    (MessagePopover, SAPMLibrary) =>
        MessagePopover.extend("errorhandler.MessagePopover", {
            metadata: {
                library: "errorhandler",
                properties: {},
                events: {},
            },
            renderer: "sap.m.MessagePopoverRenderer",

            init(...args) {
                MessagePopover.prototype.init.apply(this, ...args);

                this.attachActiveTitlePress((event) => this.focusControl(event));
            },

            focusControl(event) {
                const button = event.getSource().getParent();
                const toolbar = button.getParent();
                const page = toolbar.getParent();

                const message = event
                    .getParameter("item")
                    .getBindingContext()
                    .getObject();
                const control = sap.ui.getCore().byId(message.getControlId());

                if (!control || !page || typeof page.scrollToElement !== "function")
                    return;

                page.scrollToElement(control.getDomRef(), 200);
                setTimeout(() => control.focus(), 300);
            },

            triggerEmail() {
                const bundle = this.resBundle;
                const appComponent = this.getAppComponent();

                const subject = bundle.getText(
                    "mailTitle",
                    appComponent
                        ? appComponent.getManifest()["sap.app"].title
                        : [window.location.href]
                );
                const body = this.getUserInfos() + this.getMsgInfos();

                SAPMLibrary.URLHelper.triggerEmail({
                    address: bundle.getText("mailAddress"),
                    subject,
                    body,
                });
            },

            getAppComponent() {
                if (!sap.ushell || !sap.ushell.Container) return undefined;

                return sap.ushell.Container.getService(
                    "AppLifeCycle"
                ).getCurrentApplication().componentInstance;
            },

            getUserInfos() {
                if (!sap.ushell || !sap.ushell.Container) return "";

                const appComponent = this.getAppComponent();
                const user = appComponent.getModel("user").getProperty("/user");

                // falls das UserModel genutzt wird sollen die Daten des aktuellen Benutzers ausgelesen werden
                // ansonsten wird der User der Shell verwendet
                if (user) {
                    return this.resBundle.getText("userInformationLong", [
                        user.PersonalFullName,
                        user.UserName,
                        user.PlantName,
                        user.Plant,
                    ]);
                }

                return this.resBundle.getText(
                    "userInformationShort",
                    sap.ushell.Container.getService("UserInfo").getId()
                );
            },

            getMsgInfos() {
                return JSON.stringify(
                    this.messageModel.getData().map((message) => {
                        // anstatt dem Timestamp soll Datum und Uhrzeit in leslicher Form ausgegeben werden
                        const time = new Date(message.date);

                        return {
                            ...message,
                            date: time.toLocaleDateString(),
                            time: time.toLocaleTimeString(),
                        };
                    })
                );
            },
        })
);
