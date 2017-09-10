import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {
  Platform,
  View,
  TouchableOpacity,
  TextInput,
  Text,
  Image,
  ActivityIndicator,
  Keyboard,
  LayoutAnimation,
  Dimensions
} from 'react-native'

// custom
import I18n from 'react-native-i18n'
import Styles from './Styles/MessageScreenStyle'
import {Images, Metrics} from '../Themes'
import MessageActions from '../Redux/MessageRedux'
import BaseListView from '../Components/BaseListView'
import ImagePicker from 'react-native-image-picker'
import Emoji from 'react-native-emoji'
import WebIM from '../Lib/WebIM'
import debounce from 'lodash.debounce'

const options = {
  title: 'Select Avatar',
  customButtons: [
    {name: 'fb', title: 'Choose Photo from Facebook'}
  ],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}

class MessageScreen extends React.Component {
  // ------------ init -------------
  constructor (props) {
    super(props)

    console.log(props)

    this.state = {
      height: 34,
      isRefreshing: false,
      modalVisible: false,
      focused: false,
      visibleHeight: Metrics.screenHeight,
      isEmoji: false
    }
  }

  // ------------ logic  ---------------
  updateList (props) {
    const {message, chatType, id} = props
    const chatTypeData = message[chatType] || {}
    const chatData = chatTypeData[id] || []
    this.setState({
      messages: {
        messages: chatData
      }
    })
  }

  // ------------ lifecycle ------------
  componentDidMount () {
    this.updateList(this.props)
  }

  componentWillReceiveProps (nextProps) {
    this.updateList(nextProps)
  }

  componentWillMount () {
    if (Platform.OS === 'ios') {
      this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardDidShow)
      this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardDidHide)
    } else {
    }
  }

  componentWillUnmount () {
    this.keyboardDidShowListener && this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener && this.keyboardDidHideListener.remove()
  }

  keyboardDidShow = (e) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    let newSize = Metrics.screenHeight - e.endCoordinates.height
    this.setState({
      keyboardHeight: e.endCoordinates.height,
      visibleHeight: newSize
    })
  }

  keyboardDidHide = (e) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({
      keyboardHeight: 0,
      visibleHeight: Metrics.screenHeight
    })
  }
  // ------------ handlers -------------
  handleRefresh () {
    this.setState({isRefreshing: true})
    setTimeout(() => {
      this.setState({isRefreshing: false})
    }, 1000)
  }

  handleFocusSearch () {
    this.setState({
      focused: true,
      isEmoji: false
    })
  }

  handleBlurSearch () {
    this.setState({focused: false})
  }

  handleSend () {
    if (!this.state.value || !this.state.value.trim()) return
    this.props.sendTxtMessage(this.props.chatType, this.props.id, {
      msg: this.state.value.trim()
    })
    this.setState({
      value: '',
      height: 34
    })
  }

  handleChangeText (v) {
    // 场景1：正常+ -
    // 场景2：从中间位置+ - -> 如果删除一个字符后字符串匹配，则非中间位置
    // 场景3：删除操作可以从textInput直接编辑，适应于以上情况
    // 场景5：从emoji的删除按钮删除，则从末尾位置编辑
    // 场景6：点击外部区域隐藏emoji框
    const splitValue = this.state.value ? this.state.value.split('') : []
    splitValue.pop()
    if (v === splitValue.join('')) {
      this.handleEmojiCancel()
    }
  }

  handleImagePicker () {
    this.setState({
      isEmoji: false
    })
    ImagePicker.launchImageLibrary(options, (response) => {
      console.log('Response = ', response)

      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        let source = null
        if (Platform.OS === 'ios') {
          source = {uri: response.uri.replace('file://', ''), isStatic: true}
        } else {
          source = {uri: response.uri, isStatic: true}
        }

        response.uri = source.uri
        const {chatType, id} = this.props
        this.props.sendImgMessage(chatType, id, {}, response)
      }
    }
    )
  }

  handleCameraPicker () {
    this.setState({
      isEmoji: false
    })
    ImagePicker.launchCamera(options, (response) => {
      console.log('Response = ', response)

      if (response.didCancel) {
        console.log('User cancelled image picker')
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error)
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton)
      } else {
        let source = null
        if (Platform.OS === 'ios') {
          source = {uri: response.uri.replace('file://', ''), isStatic: true}
        } else {
          source = {uri: response.uri, isStatic: true}
        }

        response.uri = source.uri
        const {chatType, id} = this.props
        this.props.sendImgMessage(chatType, id, {}, response)
      }
    })
  }

  handleEmojiOpen () {
    this.setState({
      isEmoji: !this.state.isEmoji
    })

    this.refs.search.blur()
  }

  handleEmojiClick (v) {
    this.setState({
      value: (this.state.value || '') + v
    })
  }

  handleEmojiCancel () {
    if (!this.state.value) return
    const arr = this.state.value.split('')
    const len = arr.length
    let newValue = ''

    if (arr[len - 1] !== ']') {
      arr.pop()
      newValue = arr.join('')
    } else {
      const index = arr.lastIndexOf('[')
      newValue = arr.splice(0, index).join('')
    }

    this.setState({
      value: newValue
    })
  }

// ------------ renders -------------
  _renderRow (rowId, sectionId, rowID, highlightRow) {
    const {message} = this.props
    const rowData = message.byId[rowId] || {}
    if (rowData.bySelf) {
      return this._renderRightRow(rowData)
    } else {
      return this._renderLeftRow(rowData)
    }
  }

  _renderRightRow (rowData) {
    const chatType = rowData.body.type || ''
    const obj = {
      txt: this._renderRightTxt.bind(this),
      img: this._renderRightImg.bind(this)
    }
    return typeof
      obj[chatType] === 'function' ? (obj[chatType](rowData)) : null
  }

  _renderRightTxt (rowData = {}) {
    return (
      <View style={[Styles.row, Styles.directionEnd]}>
        <Image source={Images.default} resizeMode='cover' style={[Styles.rowLogo, Styles.rowLogoRight]} />
        <View style={Styles.rowMessage}>
          <View style={[Styles.message, Styles.messageRight]}>
            <Text style={[Styles.messageText, Styles.messageTextRight]}>{this._renderTxt(rowData.body.msg || '')}</Text>
          </View>
          <Text style={[Styles.timeText, Styles.textRight]}>{this._renderDate(rowData.time)}</Text>
        </View>
      </View>
    )
  }

  _renderRightImg (rowData = {}) {
    const {body} = rowData
    const maxWidth = 250
    let width = Math.min(maxWidth, body.width)
    let height = body.height * width / body.width
    const loading = rowData.status === 'sending' ? (
      <ActivityIndicator style={{margin: 5}} />
      ) : null

    return (
      <View style={[Styles.row, Styles.directionEnd]}>
        <Image source={Images.default} resizeMode='cover' style={[Styles.rowLogo, Styles.rowLogoRight]} />
        <View style={Styles.rowMessage}>
          <View style={[Styles.message, Styles.messageRight, Styles.messageImage]}>
            <Image source={{uri: body.uri || body.url}}
              style={[Styles.rowImage, {width, height}]} />
          </View>
          <Text style={[Styles.timeText, Styles.textRight]}>{this._renderDate(rowData.time)}</Text>
        </View>
        {loading}
      </View>
    )
  }

  _renderLeftRow (rowData) {
    const chatType = rowData.body.type || ''
    const obj = {
      txt: this._renderLeftTxt.bind(this),
      img: this._renderLeftImg.bind(this)
    }
    return typeof
      obj[chatType] === 'function' ? (obj[chatType](rowData)) : null
  }

  _renderLeftTxt (rowData = {}) {
    return (
      <View style={Styles.row}>
        <Image source={Images.default} resizeMode='cover' style={Styles.rowLogo} />
        <View style={Styles.rowMessage}>
          <Text style={Styles.nameText}>{rowData.from}</Text>
          <View style={Styles.message}>
            <Text style={Styles.messageText}>{this._renderTxt(rowData.body.msg || '')}</Text>
          </View>
          <Text style={Styles.timeText}>{this._renderDate(rowData.time)}</Text>
        </View>
      </View>
    )
  }

  _renderLeftImg (rowData = {}) {
    const {body} = rowData
    const maxWidth = 250
    let width = Math.min(maxWidth, body.width)
    let height = body.height * width / body.width
    const loading = rowData.status === 'sending' ? (
      <ActivityIndicator style={{margin: 5}} />
      ) : null

    return (
      <View style={Styles.row}>
        <Image source={Images.default} resizeMode='cover' style={Styles.rowLogo} />
        <View style={Styles.rowMessage}>
          <Text style={Styles.nameText}>{rowData.from}</Text>
          <View style={[Styles.message, Styles.messageImage]}>
            <Image source={{uri: body.uri || body.url}}
              style={[Styles.rowImage, {width, height}]} />
          </View>
          <Text style={Styles.timeText}>{this._renderDate(rowData.time)}</Text>
        </View>
        {loading}
      </View>
    )
  }

  _renderDate (time) {
    const d = new Date(time)
    return `${d.getMonth() + 1}-${d.getDay() > 9 ? d.getDay() : '0' + d.getDay()} ${d.getHours()}:${d.getMinutes()}`
  }

  _renderSendButton () {
    const {focused} = this.state

    return focused ? (
      <TouchableOpacity style={Styles.searchExtra} onPress={this.handleSend.bind(this)}>
        <Text style={Styles.sendText}>{I18n.t('send')}</Text>
      </TouchableOpacity>
      ) : null
  }

  _renderTxt (txt) {
    const emoji = WebIM.emoji

    let rnTxt = []
    let match = null
    const regex = /(\[.*?\])/g
    let start = 0
    let index = 0
    while (match = regex.exec(txt)) {
      index = match.index
      if (index > start) {
        rnTxt.push(txt.substring(start, index))
      }
      if (match[1] in emoji.map) {
        rnTxt.push((
          <Emoji style={{marginBottom: 3}} key={`emoji-${index}-${match[1]}`} name={emoji.map[match[1]]} />
        ))
      } else {
        rnTxt.push(match[1])
      }
      start = index + match[1].length
    }
    rnTxt.push(txt.substring(start, txt.length))

    return rnTxt
  }

  _renderEmoji () {
    const {isEmoji} = this.state
    const emoji = WebIM.emoji
    const emojiStyle = []
    const rowIconNum = 7
    const emojis = Object.keys(emoji.map).map((v, k) => {
      const name = emoji.map[v]
      return (
        <TouchableOpacity key={v + k} onPress={() => {
          this.handleEmojiClick(v)
        }}>
          <Text style={[Styles.emoji, emojiStyle]}><Emoji name={name} /></Text>
        </TouchableOpacity>
      )
    })
    return isEmoji ? (
      <View style={Styles.emojiRow}>
        <View style={Styles.slide}>
          <View style={Styles.slideRow}>
            {emojis.slice(0, rowIconNum)}
          </View>
          <View style={Styles.slideRow}>
            {emojis.slice(1 * rowIconNum, rowIconNum * 2)}
          </View>
          <View style={Styles.slideRow}>
            {emojis.slice(2 * rowIconNum, rowIconNum * 3 - 1)}
            <TouchableOpacity onPress={this.handleEmojiCancel.bind(this)}>
              <Text style={[Styles.emoji, emojiStyle]}><Emoji name='arrow_left' /></Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={Styles.sendRow}>
          <TouchableOpacity style={Styles.send} onPress={this.handleSend.bind(this)}>
            <Text style={Styles.sendText}>{I18n.t('send')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      ) : null
  }

  _renderMessageBar () {
    const {value = '', isEmoji} = this.state

    return (
      <View style={Styles.search}>
        <View style={Styles.inputRow}>
          <View style={Styles.searchRow}>
            <TextInput
              ref='search'
              style={[Styles.searchInput, {height: Math.min(Math.max(this.state.height, 34), 100)}]}
              value={value}
              editable
              keyboardType='default'
              returnKeyType='default'
              autoCapitalize='none'
              autoCorrect={false}
              multiline
              onChange={(event) => {
                this.setState({
                  value: event.nativeEvent.text,
                  // 5 for padding
                  height: event.nativeEvent.contentSize.height + 5
                })
              }}
              onFocus={this.handleFocusSearch.bind(this)}
              onBlur={this.handleBlurSearch.bind(this)}
              onChangeText={this.handleChangeText.bind(this)}
              onEndEditing={() => {
              }}
              onLayout={() => {
              }}
              underlineColorAndroid='transparent'
              onSubmitEditing={() => this.refs.search.focus()}
              placeholder={I18n.t('sendMessage')}
            />
          </View>
          {this._renderSendButton()}
        </View>
        <View style={Styles.iconRow}>
          <TouchableOpacity style={Styles.iconTouch} onPress={debounce(this.handleCameraPicker.bind(this), 2000, {
            'leading': true,
            'trailing': false
          })}>
            <Image source={Images.iconCamera} />
          </TouchableOpacity>
          <TouchableOpacity style={Styles.iconTouch} onPress={debounce(this.handleImagePicker.bind(this), 2000, {
            'leading': true,
            'trailing': false
          })}>
            <Image source={Images.iconImage} />
          </TouchableOpacity>
          <TouchableOpacity style={Styles.iconTouch} onPress={this.handleEmojiOpen.bind(this)}>
            {
              isEmoji ? <Image source={Images.iconEmojiActive} /> : <Image source={Images.iconEmoji} />
            }
          </TouchableOpacity>
        </View>
        {this._renderEmoji()}
      </View>
    )
  }

// ------------ render -------------
  render () {
    const {messages = {}, keyboardHeight} = this.state
    return (
      <View style={[Styles.container, {flex: 1, flexDirection: 'column'}]}>
        <BaseListView
          autoScroll
          data={messages}
          handleRefresh={this.handleRefresh.bind(this)}
          renderRow={this._renderRow.bind(this)}
          renderSeparator={() => null}
        />
        {this._renderMessageBar()}
        <View style={{height: keyboardHeight}} />
      </View>
    )
  }
}

MessageScreen.propTypes = {
  message: PropTypes.object
}

// ------------ redux -------------
const mapStateToProps = (state) => {
  return {
    message: state.entities.message
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendTxtMessage: (chatType, id, message) => dispatch(MessageActions.sendTxtMessage(chatType, id, message)),
    sendImgMessage: (chatType, id, message, source) => dispatch(MessageActions.sendImgMessage(chatType, id, message, source))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessageScreen)
