// @flow

import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Actions as NavigationActions, Reducer, Scene, Router, TabBar, ActionConst} from 'react-native-router-flux'
import I18n from 'react-native-i18n'
// import {Platform, Text} from 'react-native'
import {Metrics, Images} from '../Themes'
import LoginScreen from '../Containers/LoginScreen'
import RegisterScreen from '../Containers/RegisterScreen'
import ContactsScreen from '../Containers/ContactsScreen'
import ContactInfoScreen from '../Containers/ContactInfoScreen'
import MessageScreen from '../Containers/MessageScreen'
import AddContactModal from '../Containers/AddContactModal'
import InfoNavBar from '../Components/InfoNavBar'
import Styles from './Styles/NavigationContainerStyle'
import NavigationDrawer from './NavigationDrawer'
import TabIcon from '../Components/TabIcon'
import WebIMActions from '../Redux/WebIMRedux'

const reducerCreate = params => {
  const defaultReducer = new Reducer(params)
  return (state, action) => {
    // console.log('ACTION:', action);
    return defaultReducer(state, action)
  }
}

const getSceneStyle = (/* NavigationSceneRendererProps */ props, computedProps) => {
  const style = {
    flex: 1,
    backgroundColor: '#fff',
    shadowColor: null,
    shadowOffset: null,
    shadowOpacity: null,
    shadowRadius: null
  }
  // console.log(computedProps)
  if (computedProps.isActive) {
    style.marginTop = computedProps.hideNavBar ? 0 : Metrics.navBarHeight
    style.marginBottom = computedProps.hideTabBar ? 0 : 50
  }
  return style
}

class NavigationRouter extends Component {
  render () {
    return (
      <Router createReducer={reducerCreate} getSceneStyle={getSceneStyle}>
        <Scene key='drawer' component={NavigationDrawer} open={false}>
          <Scene key='drawerChildrenWrapper' navigationBarStyle={Styles.navBar} titleStyle={Styles.title}
            leftButtonIconStyle={Styles.leftButton} rightButtonTextStyle={Styles.rightButton} hideNavBar
            hideTabBar>
            {/* tab bar */}
            <Scene key='contacts'
              hideTabBar={false}
              hideNavBar={false}
              tabs
              tabBarStyle={Styles.tabBarStyle}
              tabBarSelectedItemStyle={Styles.tabBarSelectedItemStyle}
            >
              <Scene initial key='tab-1'
                title=''
                image={Images.contactsActive}
                icon={TabIcon}
                onPress={() => {
                  NavigationActions.contacts({type: ActionConst.REFRESH})
                }}
              >
                <Scene initial
                  key='tabFirstContent'
                  component={ContactsScreen}
                  title='通讯录'
                  navBar={InfoNavBar}
                  leftShow={false}
                  />
              </Scene>
              <Scene key='tab-2'
                title=''
                image={Images.logout}
                icon={TabIcon}
                onPress={() => {
                  this.props.logout()
                }}
              />
            </Scene>
            {/* <Scene key="contacts" component={ContactsScreen} hideNavBar/> */}
            <Scene initial key='login' component={LoginScreen} title='Login' hideNavBar />
            <Scene key='register' component={RegisterScreen} title='Register' hideNavBar />
            {/* 添加好友 */}
            <Scene key='addContactModal' component={AddContactModal}
              title='添加好友'
              schema='modal'
              navBar={InfoNavBar}
              rightTitle={'取消'}
              onRight={() => {
                NavigationActions.pop()
              }}
              leftShow={false}
              direction='vertical'
              hideNavBar={false}
              hideTabBar
            />
            {/* 联系人信息 */}
            <Scene key='contactInfo' component={ContactInfoScreen}
              title='Contact Info'
              hideNavBar
              hideTabBar
            />
            {/* 聊天窗口 */}
            <Scene key='message' component={MessageScreen}
              title='聊天界面'
              navBar={InfoNavBar}
              hideTabBar
              hideNavBar={false}
            />
          </Scene>
        </Scene>
      </Router>
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(WebIMActions.logout())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NavigationRouter)
