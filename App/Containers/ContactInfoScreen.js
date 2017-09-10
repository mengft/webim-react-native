'use strict'

import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {
  Alert,
  View,
  Text,
  Switch,
  Image,
  ScrollView,
  TouchableOpacity,
  ActionSheetIOS,
  Platform
} from 'react-native'

// custom
import I18n from 'react-native-i18n'
import Styles from './Styles/ContactInfoScreenStyle'
import {Images, Metrics, Colors} from '../Themes'
import InfoNavBar from '../Components/InfoNavBar'
import {Actions as NavigationActions} from 'react-native-router-flux'
import RosterActions from '../Redux/RosterRedux'
import BlacklistActions from '../Redux/BlacklistRedux'

const SHEET_BUTTON = ['删除', '取消']

class ContactInfoScreen extends Component {
  // ------------ init -------------
  constructor(props) {
    super(props)
    this.state = {
      isBlocked: false
    }
  }

  // ------------ logic  ---------------
  setBlock(props) {
    const {uid, names, rosterNames} = props
    let isBlocked = names.indexOf(uid) !== -1
    this.setState({
      isBlocked
    })

    if (rosterNames.indexOf(uid) === -1) {
      NavigationActions.pop()
    }
  }

  // ------------ lifecycle  ---------------
  componentDidMount() {
    this.setBlock(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.setBlock(nextProps)
  }

  // ------------ renders -------------

  handleDelete() {
    if (Platform.OS === 'ios') {
      //TODO: 不同button如何定义不同的颜色
      ActionSheetIOS.showActionSheetWithOptions({
          options: SHEET_BUTTON,
          cancelButtonIndex: 1,
          tintColor: [Colors.orangeRed]
        },
        (buttonIndex) => {
          // this.setState({clicked: SHEET_BUTTON[buttonIndex]});
          if (SHEET_BUTTON[buttonIndex] === '删除') {
            this.props.removeContact(this.props.uid)
          }
        })
    } else if (Platform.OS === 'android') {
      this.props.removeContact(this.props.uid)
    }

  }

  handleSwitch(v) {
    this.setState({
      isBlocked: v
    })
    if (v) {
      this.props.doAddBlacklist(this.props.uid)
    } else {
      this.props.doRemoveBlacklist(this.props.uid)
    }
  }

  // ------------ render -------------
  render() {
    const {uid, names} = this.props
    const {isBlocked} = this.state

    {/*contentOffset={{x: 0, y: -10}}*/
    }
    return (
      <View style={[Styles.container]}>
        <ScrollView
          style={[Styles.scrollView, {width: Metrics.screenWidth, height: Metrics.screenHeight}]}
          ref='ScrollView'
          directionalLockEnabled={true}
          contentContainerStyle={Styles.contentContainerStyle}
          automaticallyAdjustContentInsets={false}
        >
          <View style={Styles.top}>
            <InfoNavBar containerStyle={{borderBottomWidth: 0}}/>
            <Image source={Images.default} resizeMode='cover' style={Styles.photo}/>
            <Text style={Styles.name}>{uid}</Text>
          </View>
          {/* 信息区 */}
          <View style={Styles.rowDetails}>
            <View style={[Styles.rowDetail, Styles.rowBorder]}>
              <View style={[Styles.flex]}>
                <Text style={Styles.textLabel}>{I18n.t('infoName')}</Text>
              </View>
              <View style={[Styles.flex]}>
                <Text style={Styles.text}>{uid}</Text>
              </View>
            </View>
            <View style={[Styles.rowDetail]}>
              <View style={[Styles.flex]}>
                <Text style={Styles.textLabel}>{I18n.t('infoID')}</Text>
              </View>
              <View style={[Styles.flex]}>
                <Text style={Styles.text}>{uid}</Text>
              </View>
            </View>
          </View>
          <View style={[Styles.rowDetails, Styles.operator]}>
            <View style={[Styles.rowDetail, Styles.rowBorder]}>
              <TouchableOpacity onPress={() => {
                NavigationActions.message({
                  type: 'replace',
                  chatType: 'chat',
                  id: this.props.uid
                })
              }} style={[Styles.flex]}>
                <Text style={[Styles.text, { color: '#08ba6e' }]}>进入聊天界面</Text>
              </TouchableOpacity>
            </View>
            <View style={[Styles.rowDetail]}>
              <TouchableOpacity onPress={this.handleDelete.bind(this)} style={[Styles.flex]}>
                <Text style={[Styles.text, Styles.deleteText]}>删除好友</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View >
    )
  }
}

ContactInfoScreen.propTypes = {
  // 当前查看的用户id
  uid: PropTypes.string,
}

// ------------ redux -------------
const mapStateToProps = (state) => {
  return {
    rosterNames: state.entities.roster.names,
    names: state.entities.blacklist.names
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeContact: (id) => dispatch(RosterActions.removeContact(id)),
    doAddBlacklist: (id) => dispatch(BlacklistActions.doAddBlacklist(id)),
    doRemoveBlacklist: (id) => dispatch(BlacklistActions.doRemoveBlacklist(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactInfoScreen)
