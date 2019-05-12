import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap';
import {TweenMax} from 'gsap';
import {KeyIcon} from 'mdi-react';
import * as actions from '../../../actions/index';
import Toast from '../../../globals/Toast/Toast';

class ImportPrivateKeysPartial extends Component {
   constructor(props) {
     super(props);

     this.closeModal = this.closeModal.bind(this);

     this.importPrivateKey = this.importPrivateKey.bind(this);
     this.addressImported = this.addressImported.bind(this);
     this.goBackToFirstStep = this.goBackToFirstStep.bind(this);
     this.failedToImportAddress = this.failedToImportAddress.bind(this);

     this.state = {
       currentLogLine: '',
       privateKey: '',
       privatePassword: '',
       /*
        0 = not importing
        1 = importing
        2 = error when importing
        3 = imported successfully
       */
       importing: 0
     };
   }

   unlockWallet(flag, time) {
     return new Promise((resolve, reject) => {
       const self = this;
       const batch = [];
       const obj = {
         method: 'walletpassphrase', parameters: [this.state.privatePassword, time, flag]
       };
       batch.push(obj);

       this.props.wallet.command(batch).then((data) => {
         console.log('data: ', data);
         data = data[0];
         if (data !== null && data.code === -14 ) {
           self.showWrongPassword();
         } else if(data != null && data.code === -15){
           self.showWalletNoPassword();
         } else if (data !== null && data.code === 'ECONNREFUSED') {
           console.log("daemong ain't working mate :(");
         } else if (data === null) {
           resolve()
         } else {
           console.log("in here");
           resolve(data)
           // setTimeout(() => {
           //   self.importPrivateKey();
           // }, 500);
         }
       }).catch((err) => {
         console.log('err unlocking wallet: ', err);
         reject(err)
       });
     });
   }

   async importPrivateKey() {
     if (this.state.privatePassword.length < 1) {
       this.showWrongPassword();
       return;
     }
     await this.unlockWallet(false, 5);
     this.importingAddress();
     const method = 'importprivkey';
     const parameters = [this.state.privateKey];
     this.props.wallet.command([{ method, parameters }]).then((result) => {
       console.log(result);
       if (result[0] === null) {
         console.log('imported address');
         this.addressImported();
       }
      // loading wallet
       else if (result[0].code === '-28') {
         setTimeout(() => {
           this.importPrivateKey();
         }, 500);
       } else {
         console.log('failed to import address');
         this.failedToImportAddress();
       }
     }).catch((result) => {
       console.log('ERROR IMPORTING ADDRESS: ', result);
       if (result.code === 'ECONNREFUSED') {
         this.failedToImportAddress();
       }
      // imported but rescaning
       else if (result.code === 'ESOCKETTIMEDOUT') {
         this.checkDaemonStatus();
         TweenMax.to('#importingPrivKey p', 0.5, { autoAlpha: 1 });
       }
     });
   }

   checkDaemonStatus() {
     const self = this;
     this.props.wallet.getInfo().then((data) => {
      // TODO tell the daemon connector to reindex transactions
       self.addressImported();
     })
    .catch((err) => {
      this.setState({
        currentLogLine: this.props.rescanningLogInfo.peekEnd()
      });
      console.log(this.state.currentLogLine);
      setTimeout(() => {
        self.checkDaemonStatus();
      }, 1000);
    });
   }

   importingAddress() {
     this.setState({
       importing: 1
     });
   }

   addressImported() {
     this.setState({
       importing: 3
     });
   }

   failedToImportAddress() {
     this.setState({
       importing: 2
     });
   }

   goBackToFirstStep() {
     this.setState({
       privateKey: '',
       privatePassword: '',
       importing: 0
     });
   }

   showWrongPassword() {
     Toast({
       title: this.props.lang.error,
       message: this.props.lang.wrongPassword,
       color: 'red'
     });
   }

   showWalletNoPassword(){
     Toast({
       title: this.props.lang.error,
       message: this.props.lang.wrongPassword,
       color: 'red'
     });
   }

   onTextFieldChange(key, e) {
     const value = e.target.value;
     const payload = {};
     payload[key] = value;
     this.setState(payload);
   }

   closeModal() {
     this.setState({
       importing: 0
     });
   }

   render() {
     let infomessage = null;
     if (this.state.currentLogLine != null && this.state.currentLogLine.indexOf('Still rescanning.') !== -1) {
       infomessage = this.state.currentLogLine;
     }

     return (
       <div>
         <div>
           <Input
             placeholder={this.props.lang.enterPrivKey}
             value={this.state.privateKey}
             onChange={e => this.onTextFieldChange('privateKey', e)}
             type="text"
             style={{ width: '400px' }}
             onSubmit={this.importPrivateKey}
             autoFocus
             className="mb-2 ml-auto mr-auto"
           />
           <Input
             placeholder={this.props.lang.enterYourPassword}
             value={this.state.privatePassword}
             onChange={e => this.onTextFieldChange('privatePassword', e)}
             type="password"
             style={{ width: '400px' }}
             onSubmit={this.importPrivateKey}
             className="ml-auto mr-auto"
           />
           <div className="mt-4 text-center">
             { this.props.children }
             <Button size="lg" color="primary" className="ml-2" onClick={this.importPrivateKey}>
               { this.props.lang.import }
               <KeyIcon className="ml-2" />
             </Button>
           </div>
         </div>

         <Modal isOpen={this.state.importing > 0}>
           <ModalHeader>
             { this.props.lang.importPrivateKey }
           </ModalHeader>
           <ModalBody>
             { this.state.importing === 1 && (
               <div>
                 <h5>
                   { this.props.lang.importingAddressPopup }
                 </h5>
                 { infomessage !== null && (
                   <p>
                     { infomessage }
                   </p>
                 )}
                 <p>{ this.props.lang.pleaseWait }</p>
               </div>
             )}
             { this.state.importing === 2 && (
               <span>{ this.props.lang.invalidFailedAddress }</span>
             )}
             { this.state.importing === 3 && (
               <span>{ this.props.lang.importedAddress }</span>
             )}
           </ModalBody>
           { this.state.importing !== 1 && (
             <ModalFooter>
               <Button color="primary" onClick={this.closeModal}>
                 { this.props.lang.close }
               </Button>
             </ModalFooter>
           )}
         </Modal>
       </div>
     );
   }

}

 const mapStateToProps = state => {
   return {
     lang: state.startup.lang,
     wallet: state.application.wallet,
     rescanningLogInfo: state.application.debugLog
   };
 };


 export default connect(mapStateToProps, actions, null, { withRef: true })(ImportPrivateKeysPartial);
