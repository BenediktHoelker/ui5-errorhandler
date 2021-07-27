sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/m/Button",
    "sap/m/MessagePopover",
    "sap/m/library",
  ],
  (UI5Object, Button, MessagePopover, SAPMLibrary) =>
    MessagePopover.extend("errorhandler.MessagePopover", {
      metadata: {
        library: "errorhandler",
        properties: {},
        events: {},
      },
      renderer: "sap.m.MessagePopoverRenderer",

      init(...args) {
        MessagePopover.prototype.init.apply(this, ...args);
        console.log(args);
      },

      // eslint-disable-next-line object-shorthand
      // constructor: function ({ resBundle, messageModel } = {}, ...args) {
      //   MessagePopover.apply(this, args);

      //   this.resBundle = resBundle;
      //   this.messageModel = messageModel;
      // },

      getMessagePopover({ modelName }) {
        if (!this.messagePopover) {
          this.messagePopover = this.initMessagePopover({ modelName });
        }
        return this.messagePopover;
      },

      initMessagePopover({ modelName = "message" }) {
        const messagePopover = new MessagePopover({
          headerButton: new Button({
            text: this.resBundle.getText("sendMail"),
            press: () => this.triggerEmail(),
          }),
          items: {
            path: `${modelName}>/`,
            template: sap.ui.xmlfragment(
              "errorhandler.fragments.MessageItem",
              this
            ),
          },
        });
        messagePopover.setModel(this.messageModel, modelName);
        return messagePopover;
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
