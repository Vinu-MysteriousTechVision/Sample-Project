'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ListView,
  Navigator,
  Image,
  Text,
  TextInput,
  TouchableHighlight,
  ActivityIndicator,
  AsyncStorage,
  NetInfo,
  PanResponder,
  Keyboard,
  LayoutAnimation,
  Platform

} from 'react-native';

import Header from '../components/Header';
// import Dialog from 'react-native-dialog';
import styles from '../res/style/PostStatus';
import ScrollViewKeybordHandler from '../components/KeyboardAwareScrollView';
// import CameraRollPicker from '../components/CameraRollPicker';
import _ from 'underscore';
import Client   from '../api/HttpClient';
import HttpHeader from '../api/HttpHeader';
import ApiUrl   from '../api/ApiUrl';
import Utils from '../utils/Utils';
import ModalView    from '../components/ModalPage';
import DialogBox from '../components/DialogBox';
import Constant from '../utils/Constants';
import ImageResizer from 'react-native-image-resizer';
import colors     from '../res/style/Color';

var TextInputState = require('TextInputState');
var dismissKeyboard = require('dismissKeyboard');

class PostStatusView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      contentHeight: 0,
      animating: true,
    };
  }

  componentDidMount() {
    this.txtPostStatus.focus();
    this.setState({
      text: this.props.postContentText
    });
  }

  createPostImageContentView(imageContentUrls) {
    var postImages = [];
    var _this = this;

    if (!_.isNull(imageContentUrls) && !_.isEmpty(imageContentUrls) && imageContentUrls.length > 0) {
      var closeBtn = require('../res/images/time_line/cancel-white.png');
      this.props.imageContentUrls.forEach(function (image, i) {
        postImages.push(
          <View key = {i} style={{flex: 1}}>
            <Image style = {styles.imageLayout}
                  source = {{uri: image.uri}}
                  onLoadEnd = {() => _this._loadEventFired()}>
              <ActivityIndicator animating = { _this.state.animating }
                                style = {[styles.activityIndicatorLayout ]}
                                size = "large"
                                color= {colors.themeColor}/>
            </Image>
            <View key = {i} style = {styles.imageCloseButtonLayout}>
              <TouchableHighlight style = {{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 25}}
                      underlayColor='rgba(10, 110, 150, 0.5)'
                      onPress= {_this.onRemovePostImage.bind(_this, i, image)}>
                    <Image style = {{width: 30, height: 30, alignItems: 'center', justifyContent: 'center'}} source= {closeBtn}/>
              </TouchableHighlight>
            </View>
          </View>
        )
      });
    }
    return (postImages);
  }

  onRemovePostImage(intex, image) {
    this.props.callBackRemovePostImages(intex, image);
  }

  render() {
    let { imageContentH, postContentText, imageContentUrls, dpUrl, userName, callBackNewPostData} = this.props;

    var profileIcon = require('../res/images/time_line/user_default.png');
    if((!_.isUndefined(dpUrl)) && (!_.isEmpty(dpUrl))) {
      profileIcon = {uri: dpUrl};
    }

    var isPostHaveImages = false;
    var postImages = this.createPostImageContentView(imageContentUrls);
      if(postImages.length > 0) {
        isPostHaveImages = true;
    }

    return (
      <View style= {[styles.contentPage,  {height: this.state.contentHeight + 90 + imageContentH, backgroundColor: 'red'}]}>
        <View style= {{flexDirection: 'row', height: 70, backgroundColor: 'rgba(255, 255, 255, 0)', paddingVertical: 10}}>
          <Image style={styles.imageIconLayout} source={profileIcon}/>
          <Text style= {{paddingHorizontal: 10, fontSize: 16, color: '#222222'}}>{userName}</Text>
        </View>
        <TextInput
          ref= {(obj)=> this.txtPostStatus = obj}
          placeholder="あなたの地域のことについて投稿してみよう"
          placeholderTextColor = {colors.placeholderTextColor}
          enablesReturnKeyAutomatically={true}
          returnKeyType="done"
          multiline={true}
          maxLength = {1000}
          underlineColorAndroid = "rgba(0,0,0,0)"
          onChangeText={(text) => { this.setState({text}); this.props.callBackNewPostData(text) }}
          onContentSizeChange={(event) => { this.setState({contentHeight: event.nativeEvent.contentSize.height}) }}
          style={[styles.default, {height: Math.max(20, this.state.contentHeight), textAlignVertical: 'top', color: '#787878'}]}
          value={this.state.text}/>

          {isPostHaveImages &&
          <View style={{height:imageContentH, backgroundColor: 'rgb(255, 255, 255)'}}>
            {postImages}
          </View>
          }
        </View>
    );
  }

  _loadEventFired(event) {
    this.setState({animating: false});
  }
}

class PostStatus extends Component {

  constructor(props) {
    super(props);
    this.ds = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2
    });
    this.state = {
        cancelable: false,
        text: "",
        viewHeight: 0,
        dataSource: this.ds.cloneWithRows(["1"]),
        dpUrl : this.props.route.dpUrl,
        userName: this.props.route.userName,
        addedPostImages: [],
        newPostImages: [],
        deletedPostImages: [],
        isPostEdit: false,
        modalVisible: false,
        postType: this.props.route.type,
        groupId: this.props.route.groupId,
        accesType: this.props.route.accesType,
        userStatus: this.props.route.userStatus,
        userType: this.props.route.userType,
      };
  }

  componentWillMount() {
    if(this.props.route.directMedia) {
      this.selectedPostImages(this.props.route.selectedImage);
    }
    if (!_.isEmpty(this.props.route.postData) && !_.isUndefined(this.props.route.postData) && !_.isNull(this.props.route.postData)) {
      var postImages = [];
      this.props.route.postData.image.forEach(function(img, i) {
        postImages.push({uri: img.imageurl, id: img.id});
      });

      this.setState({
          viewHeight: 220 * postImages.length,
          isPostEdit: true,
          text: _.isNull(this.props.route.postData.content)? "" : this.props.route.postData.content,
          addedPostImages: postImages,
      });
    }
  }

  componentDidMount() {
    if(this.props.drawerCallback) {
      this.props.drawerCallback(0);
    }
  }


  openModal() {
    this.setState({
      modalVisible: true
    });
  }

  closeModel(){
    this.setState({
      modalVisible: false
    });
  }

  closeModalAction = () => {
    console.log('closeModalAction');
  }

  render() {
    return (
      <Navigator
        renderScene = { this.renderScene.bind(this) }
        navigator = { this.props.navigator }/>
    );
  }

  renderScene(route, navigator) {

    return (
      <View style={styles.container} >
        <Header showRightTextButton={true} rightButtonText={'投稿'} bgColor={colors.themeColor} title={this.props.route.name} onLeftButton={this.onBack.bind(this)} onRightButton={this.onPostButtonClick.bind(this)}/>
        <ModalView modalVisible= {this.state.modalVisible} closeModal= {this.closeModalAction.bind(this)}/>
        <ScrollViewKeybordHandler
          style = {{backgroundColor: 'green'}}
          contentContainerStyle={[styles.scrollViewLayout, {backgroundColor: 'blue'}]}
          keyboardShouldPersistTaps= {true}
          keyboardDismissMode= "on-drag"
          showsVerticalScrollIndicator= {false}>
          <ListView
            style= {{flex: 1, backgroundColor: 'rgba(155, 255, 255, 1)'}}
            removeClippedSubviews= {false}
            dataSource= {this.state.dataSource}
            renderRow= {(data) => <PostStatusView imageContentH= {this.state.viewHeight}
                                                  postContentText= {this.state.text}
                                                  imageContentUrls= {this.state.addedPostImages}
                                                  dpUrl= {this.state.dpUrl}
                                                  userName= {this.state.userName}
                                                  callBackRemovePostImages= {this.removedPostImages.bind(this)}
                                                  callBackNewPostData= {this.updateNewPostData.bind(this)}/>}
            enableEmptySections= {true}
            keyboardShouldPersistTaps= {true}
            automaticallyAdjustContentInsets= {false}
            keyboardDismissMode= "on-drag" />
        </ScrollViewKeybordHandler>
        <View style={[styles.seperator, {height: 2}]}/>
        <View style= {{ height: 50, backgroundColor: '#ffffff',}}>
          <TouchableHighlight style={{flexDirection:'row',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      padding: 15,
                                      backgroundColor: 'rgba(255, 255, 255, 0.9)'}}
                              onPress={this.changeHeight.bind(this) }
                              underlayColor='rgba(240, 240, 240, 0.6)'>
              <View style= {styles.buttonContentLayout}>
                <Image style={styles.buttonIconLayout}
                        source={require('../res/images/time_line/camera.png')}/>
                <Text style={{paddingHorizontal: 5, fontSize:18, color: "#989898"}}>画像を追加する</Text>
              </View>
          </TouchableHighlight>
        </View>
        {/** dialogbox component */}
        <DialogBox ref={(dialogbox) => { this.dialogbox = dialogbox }} isOverlayClickClose= {this.state.cancelable}/>
      </View>
    );
  }

  showDialog = (title, contentMSG, type) => {
      this.dialogbox.tip({
          title: title,
          content: [contentMSG],
          btn: {
              text: 'はい',
              callback: () => {
                  if(!_.isUndefined(type)  && !_.isNull(type) && type === 1) {
                    this._clearPreference();
                  } else if(!_.isUndefined(type)  && !_.isNull(type) && type === 2) {
                    if(this.props.route.callBack) {
                      this.props.route.callBack(this.props.route.postData, 1);
                    }
                    this.onBack();
                  } else if(!_.isUndefined(type)  && !_.isNull(type) && type === 3) {
                    if(this.props.route.callBack) {
                      this.props.route.callBack(null, 2);
                    }
                    this.onBack();
                  } else if(!_.isUndefined(type)  && !_.isNull(type) && type === 4) {
                    if(this.props.route.callBack) {
                      this.props.route.callBack(null, 3);
                    }
                    this.onBack();
                  }
              },
          },
      });
  }

  async _clearPreference() {
     try {
        let keys = [Constant.AUTH_ACCESS_DETAILS, Constant.USER_DETAILS, Constant.USER_AUTHENTICATED];
        await AsyncStorage.multiRemove(keys, (err) => {});
        this.props.navigator.resetTo({
            id: 'SessionExpired',
            name: 'SessionExpired',
            gestures: {}
        });
     } catch(error) {
        this.setState({cancelable: false});
        this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Failed to logout. Please try again'
     }
  }

  changeHeight() {
    dismissKeyboard();
    TextInputState.blurTextInput(TextInputState.currentlyFocusedField());
    if(3 - this.state.addedPostImages.length > 0) {
      this.props.navigator.push({
        id: 'MediaPicker',
        name: '画像',
        maximumSelction: 3 - this.state.addedPostImages.length,
        callback: this.selectedPostImages.bind(this)
      });
    } else {
      //alert("image selction liminted to 3: " + this.state.addedPostImages.length)
    }
  }

  selectedPostImages(images) {

    for (var i = 0; i < images.length; i++) {
      this.state.addedPostImages.push(images[i]);
      if (_.isUndefined(images[i].id)) {
        this.state.newPostImages.push(images[i])
      }
    }

    this.setState({
      viewHeight: 210 * this.state.addedPostImages.length,//+ this.state.viewHeight,
      addedPostImages: this.state.addedPostImages,
      newPostImages: this.state.newPostImages,
      dataSource: this.ds.cloneWithRows(["1"])
    })
  }

  removedPostImages(intex, image){
    if (!_.isUndefined(image.id)) {
      this.state.deletedPostImages.push(image)
    } else {
      for (var i = 0; i < this.state.newPostImages.length; i++) {
        var existingObj = this.state.newPostImages[i]
        if (existingObj.uri === image.uri) {
          this.state.newPostImages.splice(i, 1);
        }
      }

    }
    this.state.addedPostImages.splice(intex, 1);
    this.setState({
      viewHeight: 210 * this.state.addedPostImages.length,
      dataSource: this.ds.cloneWithRows(["1"])
    })
  }

  async onPostButtonClick() {
    dismissKeyboard();
    TextInputState.blurTextInput(TextInputState.currentlyFocusedField());

    if(_.isUndefined(this.state.text) || _.isNull(this.state.text) || _.isEmpty(this.state.text.trim())) {
      this.showDialog('注意', '本文を入力してください'); // 'Please add post message'
      return;
    }

    if(this.state.isPostEdit) {
      this.editPostData(this.state.text);
    } else {
      this.addPostData(this.state.text);
    }
  }

  updateNewPostData(postText) {
    this.setState({text: postText})
  }

//   async resize(imageUri) {
//     return await ImageResizer.createResizedImage(imageUri, 1024, 1024, 'JPEG', 100)
//     .then((resizedImageUri) => {
//       return resizedImageUri
//     }).catch((err) => {
//       console.log(err);
//       return " ";
//     });
//   }

  async addPostData(postText) {
    this.openModal();
    //ADD POST
    var header = await HttpHeader.getPostHeader(false)
    console.log("Header "+JSON.stringify(header))
    var url = '';
    if(!_.isUndefined(this.state.postType) && !_.isNull(this.state.postType) && this.state.postType === 0) {
      url = ApiUrl.SOKONOKADO_POST;
    } else {
      url = ApiUrl.SOKONOKADO_GROUP+`/${this.state.groupId}/posts`;
    }
    console.log("url "+url)

    var form = new FormData();
    form.append("post[content]", postText);
    if(!_.isUndefined(this.state.postType) && !_.isNull(this.state.postType) && this.state.postType === 0) {
      form.append("post[category]", 0);
    } else {
      form.append("post[category]", 4);
    }
    for (var i = 0; i < this.state.newPostImages.length; i++) {

      var resizedImageUri = this.state.newPostImages[i].uri;
      if (this.state.newPostImages[i].width > 1024 || this.state.newPostImages[i].height > 1024) {
        resizedImageUri = await Utils.resizeImage(this.state.newPostImages[i].uri);
      }

      var photo = {
        'uri': resizedImageUri,
        'type': 'image/jpeg',
        'name': Utils.getUniqueFileName('tml'),
      };
      form.append("photos[image][]", photo);
    }

    Client.multipartApiCall('POST', header, form, url, onResponse.bind(this));
    function onResponse(response, errorResponse, responseStatus, responseHeaders) {
      try {
        this.closeModel();
        if (response && responseHeaders && responseStatus === 200) {
          if(this.props.route.callBack) {
                this.props.route.callBack(response.post);
          }
          this.onBack();
          //alert(JSON.stringify(response))
        } else {
              NetInfo.isConnected.fetch().then(isConnected => {
                if(isConnected) {
                  if (!_.isUndefined(errorResponse) && !_.isNull(errorResponse)
                     && !_.isUndefined(responseStatus) && !_.isNull(responseStatus)) {
                    if(responseStatus == 400 || responseStatus == 500 || responseStatus == 409) {
                        var error = errorResponse.Error;
                        if(!_.isUndefined(error)  && !_.isNull(error) && !_.isEmpty(error)) {
                           this.showDialog('エラーが発生しました', error);
                        } else {
                           this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Loading failed. Please try again.'
                        }
                    } else if(responseStatus == 401){
                        var error = errorResponse.Error;
                        this.setState({cancelable: true});
                        if(!_.isUndefined(error)  && !_.isNull(error) && !_.isEmpty(error)) {
                          this.showDialog('エラーが発生しました', error, 1);
                        } else {
                          this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。', 1); // 'Session expired. Please login'
                        }
                    } else if(responseStatus == 404) {
                        var error = errorResponse.Error;
                        if(!_.isUndefined(error)  && !_.isNull(error) && !_.isEmpty(error)) {
                          if(errorResponse.error_code === 1201) {
                              this.setState({cancelable: true});
                              this.showDialog('エラーが発生しました', error, 2);
                          } else if(!_.isUndefined(this.state.postType) && !_.isNull(this.state.postType) && this.state.postType === 1) {
                            if(errorResponse.error_code === 1202) {
                                // Go back
                                this.setState({cancelable: true});
                                this.showDialog('エラーが発生しました', error, 3);
                            } else if(errorResponse.error_code === 1203 || errorResponse.error_code === 1204) {
                              if(this.state.accesType === 1) {
                                // Go back
                                this.setState({cancelable: true});
                                this.showDialog('エラーが発生しました', error, 3);
                              } else {
                                //Reload
                                this.setState({cancelable: true});
                                this.showDialog('エラーが発生しました', error, 4);
                              }
                            } else {
                              this.showDialog('エラーが発生しました', error);
                            }
                          } else {
                            this.showDialog('エラーが発生しました', error);
                          }
                        } else {
                          this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Session expired. Please login'
                        }
                    } else if(responseStatus == 422) {
                        var error = errorResponse.Error;
                        if(!_.isUndefined(error)  && !_.isNull(error) && !_.isEmpty(error)) {
                          var keys = Object.keys(error);
                          if(!_.isEmpty(keys)) {
                            var alertMessage = this.parseError(keys, error)
                            this.showDialog('エラーが発生しました', alertMessage);
                          } else {
                            this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Session expired. Please login'
                          }
                        } else {
                          this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Session expired. Please login'
                        }
                    } else {
                      this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Failed to add timeline post. Please try again.'
                    }
                  } else {
                      this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Failed to add timeline post. Please try again.'
                  }
                } else {
                  this.showDialog('エラーが発生しました', 'ネットワークに接続できません。しばらくしてからもう一度お試しください。'); // 'Network not available. Please check network settings.'
                }
              });
        }
      } catch (error) {
        this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Failed to add timeline post. Please try again.'
      }
    }
  }

  parseError(errorkeys, errorJson) {
    var message = '';
    var key;
    for (key in errorkeys) {
      message += errorJson[errorkeys[key]][0] + "\n";
    }
    if(message.length > 0) {
      message = message.substring(0, message.length - 1);
    } else {
      message = "エラーが発生しました。しばらくしてからもう一度お試しください。"
    }
    return message;
  }


  async editPostData(postText) {
    //EDIT POST
    this.openModal();
    var header = await HttpHeader.getPostHeader(false)
    console.log("Header "+JSON.stringify(header))
    var postId = this.props.route.postData.id;
    var url = '';
    if(!_.isUndefined(this.state.postType) && !_.isNull(this.state.postType) && this.state.postType === 0) {
      url = ApiUrl.SOKONOKADO_POST+`/${postId}`;
    } else {
      url = ApiUrl.SOKONOKADO_GROUP+`/${this.state.groupId}/post/${postId}`;
    }
    console.log("url "+url)
    var form = new FormData();
    form.append("post[content]", postText);
    if(!_.isUndefined(this.state.postType) && !_.isNull(this.state.postType) && this.state.postType === 0) {
      form.append("post[category]", 0);
    } else {
      form.append("post[category]", 4);
    }

    for (var i = 0; i < this.state.newPostImages.length; i++) {
      var resizedImageUri = this.state.newPostImages[i].uri;
      if (this.state.newPostImages[i].width > 1024 || this.state.newPostImages[i].height > 1024) {
        resizedImageUri = await Utils.resizeImage(this.state.newPostImages[i].uri);
      }

      var photo = {
        'uri': resizedImageUri,
        'type': 'image/jpeg',
        'name': Utils.getUniqueFileName('tml'),
      };
      form.append("photos[image][]", photo);
    }

    this.state.deletedPostImages.forEach(function(image, i) {
      form.append("delete_photos[id][]", image.id);
    });

    Client.multipartApiCall('PUT', header, form, url, onResponse.bind(this));
    function onResponse(response, errorResponse, responseStatus, responseHeaders) {
      try {
        this.closeModel();
        if (response && responseHeaders && responseStatus === 200) {
          if(this.props.route.callBack) {
            this.props.route.callBack(response.post);
          }
          this.onBack();
        } else {
              NetInfo.isConnected.fetch().then(isConnected => {
                if(isConnected) {
                  if (!_.isUndefined(errorResponse) && !_.isNull(errorResponse)
                     && !_.isUndefined(responseStatus) && !_.isNull(responseStatus)) {
                    if(responseStatus == 400 || responseStatus == 500 || responseStatus == 409) {
                        var error = errorResponse.Error;
                        if(!_.isUndefined(error)  && !_.isNull(error) && !_.isEmpty(error)) {
                           this.showDialog('エラーが発生しました', error);
                        } else {
                           this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Loading failed. Please try again.'
                        }
                    } else if(responseStatus == 401){
                        var error = errorResponse.Error;
                        this.setState({cancelable: true});
                        if(!_.isUndefined(error)  && !_.isNull(error) && !_.isEmpty(error)) {
                          this.showDialog('エラーが発生しました', error, 1);
                        } else {
                          this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。', 1); // 'Session expired. Please login'
                        }
                    } else if(responseStatus == 404) {
                        var error = errorResponse.Error;
                        if(!_.isUndefined(error)  && !_.isNull(error) && !_.isEmpty(error)) {
                          if(errorResponse.error_code === 1201) {
                              this.setState({cancelable: true});
                              this.showDialog('エラーが発生しました', error, 2);
                          } else if(!_.isUndefined(this.state.postType) && !_.isNull(this.state.postType) && this.state.postType === 1) {
                            if(errorResponse.error_code === 1202) {
                                // Go back
                                this.setState({cancelable: true});
                                this.showDialog('エラーが発生しました', error, 3);
                            } else if(errorResponse.error_code === 1203 || errorResponse.error_code === 1204) {
                              if(this.state.accesType === 1) {
                                // Go back
                                this.setState({cancelable: true});
                                this.showDialog('エラーが発生しました', error, 3);
                              } else {
                                //Reload
                                this.setState({cancelable: true});
                                this.showDialog('エラーが発生しました', error, 4);
                              }
                            } else {
                              this.showDialog('エラーが発生しました', error);
                            }
                          } else {
                            this.showDialog('エラーが発生しました', error);
                          }
                        } else {
                          this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Session expired. Please login'
                        }
                    } else if(responseStatus == 422) {
                        var error = errorResponse.Error;
                        if(!_.isUndefined(error)  && !_.isNull(error) && !_.isEmpty(error)) {
                          var keys = Object.keys(error);
                          if(!_.isEmpty(keys)) {
                            var alertMessage = this.parseError(keys, error)
                            this.showDialog('エラーが発生しました', alertMessage);
                          } else {
                            this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Session expired. Please login'
                          }
                        } else {
                          this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Session expired. Please login'
                        }
                    } else {
                      this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Failed to add timeline post. Please try again.'
                    }
                  } else {
                      this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Failed to add timeline post. Please try again.'
                  }
                } else {
                  this.showDialog('エラーが発生しました', 'ネットワークに接続できません。しばらくしてからもう一度お試しください。'); // 'Network not available. Please check network settings.'
                }
              });
        }
      } catch (error) {
        this.showDialog('エラーが発生しました', 'エラーが発生しました。しばらくしてからもう一度お試しください。'); // 'Failed to edit timeline post. Please try again.'
      }
    }
  }

  onBack() {
    dismissKeyboard();
    TextInputState.blurTextInput(TextInputState.currentlyFocusedField());
    if(this.props.drawerCallback) {
      this.props.drawerCallback(1);
    }
    this.props.navigator.pop();
  }
}

module.exports = PostStatus;
