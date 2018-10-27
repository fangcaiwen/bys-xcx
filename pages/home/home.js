// pages/house/house.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    roomList:[],
    homeTitle:'家',
    curroomInfo:{},
    token:'',
    personId:'',
    roomLocks:[]
  },

  //点击页面其他元素事件
  clickToOtherBtnEvent:function(){
    if (this.data.token) {
      wx.showToast({
        title: "未完待续",
        icon: "success",
        duration: 1000,
        mask: true
      });
    } else {
      wx.switchTab({
        url: '../../pages/me/me',
      })
    }
  },

  // 点击家title事件
  clickToListLocks:function(e){
    var that=this;
    if (this.data.token){
      var newRoomList = that.data.roomList.slice(0,6);
      wx.showActionSheet({
        itemList: newRoomList.map(function (v) {
          return v.communityName + '-' + v.roomNo
        }),//显示的列表项
        success: function (res) {//res.tapIndex点击的列表项
          that.setData({
            homeTitle: newRoomList[res.tapIndex].communityName + '-' + newRoomList[res.tapIndex].roomNo,
            curroomInfo: newRoomList[res.tapIndex]
          });
          that.changeRoomEvent(newRoomList[res.tapIndex]);
        },
        fail: function (res) { },
        complete: function (res) { }
      })
    }else{
      wx.showToast({
        title: "请先登录",
        icon: "loading",
        duration: 1000,
        mask: true
      });
      wx.switchTab({
        url: '../../pages/me/me',
      }) 
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log("onLoad");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady");
  },
  // 判断是否登录，传入登录回调
  isLoaginCallBack:function(){
    var that = this;
    wx.getStorage(
      {
        key: 'userInfo',
        success: function (res) {
          if (res.data) {
            that.setData({
              token: res.data.ticket,
              personId: res.data.personId,
            });
            that.getRoomListData(res.data.personId, res.data.ticket);
          }
        },
        fail: function (res) { 
          console.log('1212',res);
          wx.switchTab({
            url: '../../pages/me/me',
          }) 
        },
        complete: function (res) { console.log('qqq',res) }
      })
  },

  // 请求房间列表数据
  getRoomListData:function(personId,token){
    var that=this;
    wx.request({
      url: 'https://saas.lianyuplus.com/saas20/api/1/AptGuest/customer/tenant/listRooms/personId/' + personId,
      data: {
        withTicketTypes: true,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'intebox_sso_app': 'AptGuest',
        'intebox_sso_tkt': token
      },
      method: 'POST',
      success: function (res) {
        var rel = res.data;
        if (rel.errorCode == 0) {
          that.getCurrenStorage(function(){
            that.setData({
              curroomInfo: rel.data[0],
              homeTitle: rel.data[0].communityName + '-' + rel.data[0].roomNo
            });
            that.changeRoomEvent(rel.data[0]);
          });
          that.setData({
            roomList: rel.data,
          });
        } else if (rel.errorCode == -9999){
          wx.showToast({
            title: rel.message,
            icon:"loading",
            duration: 1000,
            mask: true
          });
          // 清空本地token
          wx.clearStorage();
          wx.switchTab({
            url: '../../pages/me/me',
          })

        }else{
          wx.showToast({
            title: rel.message,
            icon: "loading",
            duration: 1000,
            mask: true
          })
        }
      }
    });
  },
  // 请求本地有无当前房间
  getCurrenStorage:function(callBack){
    var that = this;
    wx.getStorage(
      {
        key: 'roomInfo',
        success: function (res) {
        },
        fail: function (res) { console.log(res) },
        complete: function (res) {
          if (res.data) {
            that.setData({
              curroomInfo: res.data,
              homeTitle: res.data.communityName + '-' + res.data.roomNo
            });
            that.getRoomLocksData();
          } else {
            callBack();
          }
         }
      })
    
  },

  // 切换房间事件
  changeRoomEvent:function(roomInfo){
    this.setRoomInfo(roomInfo);
    // 获取房间门锁列表
    this.getRoomLocksData();
   
  },

  // 设置本地当前房间缓存roomInfo
  setRoomInfo:function(roomInfo){
    wx.setStorage({
      key: 'roomInfo',
      data: roomInfo,
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow");
    this.isLoaginCallBack();
  },

  // 请求房间门锁列表数据
  getRoomLocksData: function () {
    var that = this;
    wx.showToast({
      title: "加载中",
      icon: "loading",
      duration: 1000,
      mask: true
    })
    wx.request({
      url: 'https://saas.lianyuplus.com/saas20/api/1/AptGuest/doorlock/keys',
      data: {
        operatorId: that.data.personId,
        areaId: that.data.curroomInfo.roomId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'intebox_sso_app': 'AptGuest',
        'intebox_sso_tkt': that.data.token
      },
      method: 'POST',
      success: function (res) {
        var rel = res.data;
        if (rel.errorCode == 0) {
          that.setData({
            roomLocks: rel.data,
          });
        } else {
          wx.showToast({
            title: rel.message,
            icon: "loading",
            duration: 1000,
            mask: true
          })
        }
      }
    });
  },

  // 点击开门
  openLockEvent:function(e){
    var lockId = e.currentTarget.dataset.id;
    var that = this;
    wx.showToast({
      title: "开门中",
      icon: "loading",
      duration: 1000,
      mask: true
    })
    wx.request({
      url: 'https://saas.lianyuplus.com/saas20/api/1/AptGuest/devicefacade/doorlockx/unlock/operator/' + that.data.personId + '/lock/' + lockId,
      data: {
        operatorId: that.data.personId,
        areaId: that.data.curroomInfo.roomId
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded', // 默认值
        'intebox_sso_app': 'AptGuest',
        'intebox_sso_tkt': that.data.token
      },
      method: 'GET',
      success: function (res) {
        var rel = res.data;
        if (rel.errorCode == 0) {
          if (rel.data.success){
            wx.showToast({
              title: "开门成功",
              icon: "success",
              duration: 1000,
              mask: true
            }) 
          }
        } else {
          wx.showToast({
            title: rel.message,
            icon: "loading",
            duration: 1000,
            mask: true
          })
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})