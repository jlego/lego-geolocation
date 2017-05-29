/**
 * 视图类: 地图定位
 * 作者: yuronghui
 * 创建日期: 2017/5/29
 */
class View extends Lego.UI.Baseview {
    constructor(opts = {}) {
        const options = {
            mapApi: '',
            placeholder: '搜索',
            data: {}
        };
        Object.assign(options, opts);
        super(options);
    }
    components() {
        let opts = this.options,
            that = this;
        opts.context.result = opts.data;
        this.addCom({
            el: '#input_' + opts.vid,
            placeholder: opts.placeholder,
            style: {
                position: 'absolute',
                top: 20,
                left: 20,
                width: 350,
            },
            value: opts.data.address || '',
            onChange(self, address) {
                if(that.geocoder){
                    that.geocoder.getLocation(address, function(status, result) {
                        if (status == 'complete' && result.geocodes.length) {
                            let point = that.marker.getPosition();
                            that.marker.setPosition(result.geocodes[0].location);
                            that.map.setCenter(point);
                            opts.context.result = {
                                address: address,
                                lnglat: point.lng + ',' + point.lat
                            };
                        }
                    });
                }
            }
        });
    }
    render() {
        let opts = this.options;
        return hx `
        <div class="map-div">
            <div id="map_container"></div>
            <inputs id='input_${opts.vid}'></inputs>
        </div>`;
    }
    renderAfter() {
        let opts = this.options,
            that = this;
        function getLocation(){
            let options = {
                enableHighAccuracy: true,
                maximumAge: 1000
            };
            if(navigator.geolocation){
                //浏览器支持geolocation
                navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
            }else{
                //浏览器不支持geolocation
            }
        }
        //成功时
        function onSuccess(position){
            let longitude = position.coords.longitude; //经度
            let latitude = position.coords.latitude; //纬度
            that.renderMap(longitude, latitude);
        }
        function onError(error){
            debug.warn(error);
            // Lego.UI.message('error', error.message);
            that.renderMap();
        }
        if(opts.data.lnglat){
            this.renderMap(opts.data.lnglat.split(','));
        }else{
            getLocation();
        }
    }
    renderMap(lng, lat){
        let that = this,
            opts = this.options,
            inputView = Lego.getView('#input_' + opts.vid);
        if(opts.mapApi){
            Lego.loadScript(opts.mapApi, function(){
                that.map = new AMap.Map('map_container', {
                    resizeEnable: true,
                    zoom: 14,
                    center: lng && lat ? new AMap.LngLat(lng, lat) : [114.057954, 22.544367]
                });
                AMap.plugin('AMap.Geocoder', function() {
                    that.geocoder = new AMap.Geocoder();
                    that.marker = new AMap.Marker({
                        map: that.map,
                        bubble: true
                    });
                    if(opts.data.lnglat){
                        that.marker.setPosition(opts.data.lnglat.split(','));
                    }
                    that.map.on('click', function(e) {
                        that.marker.setPosition(e.lnglat);
                        that.geocoder.getAddress(e.lnglat, function(status, result) {
                            // debug.warn(e.lnglat);
                            if (status == 'complete') {
                                inputView.options.value = result.regeocode.formattedAddress;
                                opts.context.result = {
                                    address: inputView.options.value,
                                    lnglat: e.lnglat.lng + ',' + e.lnglat.lat
                                };
                            }
                        })
                    });
                });
            }, 'amap');
        }
    }
}
Lego.components('maps', View);
export default View;
