import React, { Component } from 'react'
import { View, StatusBar } from 'react-native'
import NavigationRouter from '../Navigation/NavigationRouter'
import { connect } from 'react-redux'
import StartupActions from '../Redux/StartupRedux'
import ReduxPersist from '../Config/ReduxPersist'

import styles from './Styles/RootContainerStyle'

class RootContainer extends Component {
  componentDidMount () {
    if (!ReduxPersist.active) {
      this.props.startup()
    }
  }

  componentWillReceiveProps (nextProps) {
    console.log('componentWillReceiveProps', nextProps)
  }

  render () {
    return (
      <View style={styles.applicationView}>
        <StatusBar />
        <NavigationRouter />
      </View>
    )
  }
}

const mapStateToDispatch = (dispatch) => ({
  startup: () => dispatch(StartupActions.startup())
})

export default connect(null, mapStateToDispatch)(RootContainer)
