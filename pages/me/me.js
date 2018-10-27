// pages/me/me.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    password:'',
    isLogin:false,
    nickName:'',
    headSrc:''
  },

  // 监听手机号输入
  phoneInputFunction:function(e){
     this.data.phone=e.detail.value;
  },

  // 监听手机叉叉
  clickPhoneDelete:function(e){
    this.setData({
      phone:''
    });
  },

  // 监听密码输入
  passwordInputFunction: function (e) {
    this.data.password = e.detail.value;
  },

  // 监听密码叉叉
  clickPasswordDelete:function(e){
    this.setData({
      password: ''
    });
  },

  // 点击登录按钮事件
  loginBtnClickEvent:function(e){
    console.log("phone:",this.data.phone);
    console.log("password:", this.data.password);
    if(this.data.phone==""||this.data.password==""){
      wx.showToast({
        title: "用户名密码为空",
        duration: 1000,
        mask: true
      })
      return;
    }
    var that = this;
    wx.request({
      url: 'https://saas.lianyuplus.com/saas20/api/1/AptGuest/sysLogin/customer/authenticate',
      data:{
        username: that.data.phone,
        pwd:that.data.password,
        deviceSign:""
      },
       header: {
         'content-type': 'application/x-www-form-urlencoded' // 默认值
        },
      method:'POST',
      success:function(res){
         var rel = res.data;
        if (rel.errorCode!=0){
          wx.showToast({
            title: rel.message,
            duration: 1000,
            mask: true
          })
        }else{
          wx.showToast({
            title: "登录成功",
            duration: 1000,
            mask: true
          });
          that.setData({
            isLogin:true,
            nickName: rel.data.cusotmName,
            headSrc: rel.data.headPicUrl
          });
          wx.setStorage({
            key: 'userInfo',
            data: rel.data,
          });
          wx.switchTab({
            url: '../../pages/home/home',
          })
        }
      }
      
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getStorage(
      {
        key: 'userInfo',
        success: function (res) {
          if(res.data){
            that.setData({
              isLogin: true,
              nickName: res.data.cusotmName,
              headSrc: res.data.headPicUrl
            });
          }
        },
        fail: function (res) { console.log(res) },
        complete: function (res) { console.log(res) }
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
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