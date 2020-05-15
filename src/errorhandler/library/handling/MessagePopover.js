sap.ui.define(
  ["sap/m/Button", "sap/m/MessagePopover", "sap/m/library"],
  function (Button, MessagePopover, SAPMLibrary) {
    return {
      getMessagePopover() {
        if (!this.messagePopover) {
          this.messagePopover = this.initMessagePopover();
        }
        return this.messagePopover;
      },

      initMessagePopover() {
        const messagePopover = new MessagePopover({
          headerButton: new Button({
            text: this.getResBundle().getText("sendMail"),
            press: () => {
              this.createEmail(this);
            },
          }),
          items: {
            path: "message>/",
            template: sap.ui.xmlfragment(
              "errorhandler.library.fragments.MessageItem",
              this
            ),
          },
        });
        messagePopover.setModel(this.getMessageModel(), "message");
        return messagePopover;
      },

      createEmail() {
        const bundle = this.getResBundle();
        const appComponent = sap.ushell.Container.getService(
          "AppLifeCycle"
        ).getCurrentApplication().componentInstance;

        SAPMLibrary.URLHelper.triggerEmail({
          address: bundle.getText("mailAddress"),
          subject: bundle.getText(
            "mailTitle",
            appComponent.getManifest()["sap.app"].title
          ),
          body:
            this.getUserInfos(
              appComponent.getModel("user").getProperty("/user")
            ) + this.getMsgInfos(),
        });
      },

      getUserInfos(userInfos) {
        // falls das UserModel genutzt wird sollen die Daten des aktuellen Benutzers ausgelesen werden
        // ansonsten wird der User der Shell verwendet
        if (userInfos.every(Boolean)) {
          return this.getResBundle().getText("userInformationLong", userInfos);
        }

        return this.getResBundle().getText(
          "userInformationShort",
          sap.ushell.Container.getService("UserInfo").getId()
        );
      },

      getMsgInfos() {
        return this.getMessageModel()
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
    };
  }
);
