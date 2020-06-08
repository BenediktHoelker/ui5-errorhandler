sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/m/Button",
    "sap/m/MessagePopover",
    "sap/m/library",
  ],
  function (UI5Object, Button, MessagePopover, SAPMLibrary) {
    return UI5Object.extend("errorhandler.validation.MessagePopover", {
      // eslint-disable-next-line object-shorthand
      constructor: function ({ resBundle, messageModel } = {}, ...args) {
        UI5Object.apply(this, args);

        this.resBundle = resBundle;
        this.messageModel = messageModel;
      },

      getMessagePopover() {
        if (!this.messagePopover) {
          this.messagePopover = this.initMessagePopover();
        }
        return this.messagePopover;
      },

      initMessagePopover() {
        const messagePopover = new MessagePopover({
          headerButton: new Button({
            text: this.resBundle.getText("sendMail"),
            press: () => this.triggerEmail(),
          }),
          items: {
            path: "message>/",
            template: sap.ui.xmlfragment(
              "errorhandler.fragments.MessageItem",
              this
            ),
          },
        });
        messagePopover.setModel(this.messageModel, "message");
        return messagePopover;
      },

      triggerEmail() {
        const bundle = this.resBundle;
        const appComponent = this.getAppComponent();

        const subject = bundle.getText(
          "mailTitle",
          appComponent ? appComponent.getManifest()["sap.app"].title : []
        );
        const body = appComponent
          ? this.getUserInfos(
              appComponent.getModel("user").getProperty("/user")
            ) + this.getMsgInfos()
          : this.getMsgInfos();

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

      getUserInfos(user) {
        // falls das UserModel genutzt wird sollen die Daten des aktuellen Benutzers ausgelesen werden
        // ansonsten wird der User der Shell verwendet
        if (user.every(Boolean)) {
          return this.resBundle.getText("userInformationLong", user);
        }

        return this.resBundle.getText(
          "userInformationShort",
          sap.ushell.Container.getService("UserInfo").getId()
        );
      },

      getMsgInfos() {
        return this.messageModel
          .getData()
          .map((message) => {
            // anstatt dem Timestamp soll Datum und Uhrzeit in leslicher Form ausgegeben werden
            const time = new Date(message.date);

            return JSON.stringify({
              date: time.toLocaleDateString(),
              time: time.toLocaleTimeString(),
              type: message.type,
              code: message.code,
              id: message.id,
              message: message.message,
              description: message.description,
              additionalText: message.additionalText,
              target: message.target,
              processor: message.processor.getMetadata().getName(),
              persistent: message.persistent,
              technical: message.technical,
              validation: message.validation,
            });
          })
          .reduce((arr, curr) => arr + curr, "");
      },
    });
  }
);
