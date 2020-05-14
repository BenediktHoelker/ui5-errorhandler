sap.ui.define(
  [
    "../handling/BaseHandling",
    "sap/m/Button",
    "sap/m/MessagePopover",
    "sap/m/library",
  ],
  function (BaseHandling, Button, MessagePopover, SapMLibrary) {
    return BaseHandling.extend("errorhandler.library.handling.MessagePopover", {
      getMessagePopover() {
        if (!this.oMessagePopover) {
          this.oMessagePopover = this.createMessagePopover();
        }
        return this.oMessagePopover;
      },

      createMessagePopover() {
        const oMessagePopover = new MessagePopover({
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
        oMessagePopover.setModel(this.getMessageModel(), "message");
        return oMessagePopover;
      },

      createEmail() {
        const oBundle = this.getResBundle();
        const oAppComponent = sap.ushell.Container.getService(
          "AppLifeCycle"
        ).getCurrentApplication().componentInstance;

        const sAddress = oBundle.getText("mailAddress");
        const sSubject = oBundle.getText(
          "mailTitle",
          oAppComponent.getManifest()["sap.app"].title
        );

        const sBody =
          this.getUserInfos(oAppComponent.getModel("user")) +
          this.getMsgInfos();

        SapMLibrary.URLHelper.triggerEmail(sAddress, sSubject, sBody);
      },

      getUserInfos(oUserModel) {
        // falls das UserModel genutzt wird sollen die Daten des aktuellen Benutzers ausgelesen werden
        // ansonsten wird der User der Shell verwendet

        if (oUserModel && oUserModel.getProperty("/user")) {
          const oUserData = oUserModel.getProperty("/user");
          return this.getResBundle().getText("userInformationLong", [
            oUserData.PersonalFullName,
            oUserData.UserName,
            oUserData.PlantName,
            oUserData.Plant,
          ]);
        }

        return this.getResBundle().getText(
          "userInformationShort",
          sap.ushell.Container.getService("UserInfo").getId()
        );
      },

      getMsgInfos() {
        let sAllMessages = "";

        this.getMessageModel()
          .getData()
          .forEach((message) => {
            // anstatt dem Timestamp soll Datum und Uhrzeit in leslicher Form ausgegeben werden
            const oTime = new Date(message.date);
            const sDate = oTime.toLocaleDateString();
            const sTime = oTime.toLocaleTimeString();

            const sMessage = JSON.stringify({
              date: sDate,
              time: sTime,
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

            sAllMessages = sAllMessages.concat(" \n ", sMessage);
          });

        return sAllMessages;
      },
    });
  }
);
