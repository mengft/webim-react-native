import React, {Component} from 'react'
import {
  View,
  ActivityIndicator
} from 'react-native'
import {connect} from 'react-redux'

class LoadingContent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      message: props.error,
      hide: props.hide
    }
    this.dismissModal = this.dismissModal.bind(this)
  }

  dismissModal () {
    this.setState({hide: true})
  }

  componentWillReceiveProps (nextProps) {
    console.log(nextProps)
  }

  componentDidMount () {
  }

  componentDidUpdate () {
    setTimeout(() => {
      console.log('setTimeout', this.context.drawer.props)
      if (this.context.drawer.props.open) {
        this.toggleDrawer()
        return true
      }
    }, 2000)
  }

  toggleDrawer () {
    this.context.drawer.toggle()
  }

  render () {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent'}}>
        <View style={{
          width: 70,
          height: 70,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#000',
          borderRadius: 10
        }}>
          <ActivityIndicator
            animating
            style={{}}
            color='#fff'
            size='large'
          />
        </View>
      </View>
    )
  }
}

LoadingContent.contextTypes = {
  drawer: React.PropTypes.object
}

const mapStateToProps = (state) => {
  return {
    hide: !state.ui.common.fetching
  }
}

const mapDispatchToProps = (dispatch) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(LoadingContent)
