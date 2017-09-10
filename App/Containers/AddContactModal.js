import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Alert, View, LayoutAnimation, Keyboard, Platform} from 'react-native'

// custom
import I18n from 'react-native-i18n'
import {Colors} from '../Themes'
import Styles from './Styles/AddContactModalStyle'
import Button from '../Components/Button'
import Input from '../Components/Input'
import RosterActions from '../Redux/RosterRedux'

class AddContactModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: '',
      keyboardShow: false
    }
  }

  componentWillMount () {
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide)
  }

  componentWillUnmount () {
    this.keyboardDidShowListener.remove()
    this.keyboardDidHideListener.remove()
  }

  keyboardDidShow = (e) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({
      keyboardShow: true
    })
  }

  keyboardDidHide = (e) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    this.setState({
      keyboardShow: false
    })
  }

  handleAddContact (id) {
    if (!id.trim()) {
      return
    }

    if (this.props.user === id.trim()) {
      return
    }

    this.setState({
      id: ''
    })
    Alert.alert(I18n.t('requestHasSent'))
    this.props.addContact(id)
  }

  render () {
    let {keyboardShow} = this.state

    return (
      <View style={Styles.container}>
        <View style={[Styles.body, keyboardShow && Platform.OS === 'android' ? {} : {}]}>
          <Input
            ref='addInput'
            iconName='search'
            iconSize={13}
            iconColor={Colors.iconColor}
            backgroundColor={Colors.snow}
            value={this.state.id}
            onChangeText={(v) => {
              this.setState({id: v})
            }}
            placeholder={'请输入对方的用户名'}
          />
          <Button
            color={Colors.snow}
            text={'发送好友申请'}
            styles={Styles.button}
            isHighlight={!!this.state.id}
            onPress={() => {
              this.handleAddContact(this.state.id)
            }}
          />
        </View>
      </View>
    )
  }
}

AddContactModal.propTypes = {
  user: PropTypes.string
}

// ------------ redux -------------
const mapStateToProps = (state) => {
  return {
    user: state.ui.login.username
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addContact: (id) => dispatch(RosterActions.addContact(id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddContactModal)
