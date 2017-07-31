/**
 * 视图类: 地图定位
 * 作者: yuronghui
 * 创建日期: 2017/5/29
 */
class View extends Lego.UI.Baseview {
    constructor(opts = {}) {
        const options = {
            mapApi: Lego.config.mapApi,
            placeholder: '搜索地址',
            data: {}
        };
        Object.assign(options, opts);
        super(options);
    }
    getLocationByAddress(str){
        let opts = this.options,
            that = this;
        if(this.geocoder){
            this.geocoder.getLocation(str, function(status, result) {
                if (status == 'complete' && result.geocodes.length) {
                    that.marker.setPosition(result.geocodes[0].location);
                    let point = that.marker.getPosition();
                    that.map.setCenter(point);
                    that.map.getCity(function(data) {
                        opts.context.result = {
                            address: str,
                            province: data['province'],
                            city: data['city'],
                            area: data['district'],
                            lng: point.lng,
                            lat: point.lat
                        };
                    });
                }
            });
        }
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
                top: -46,
                left: 160,
                width: 350,
            },
            onSearch(self, obj) {
                that.getLocationByAddress(obj.keyword);
            }
        });
    }
    render() {
        let opts = this.options;
        return hx `
        <div class="map-div">
            <div id="map_container"></div>
            <search id='input_${opts.vid}'></search>
        </div>`;
    }
    renderAfter() {
        let opts = this.options,
            that = this;
        this.map = new AMap.Map('map_container', {
            resizeEnable: true,
            zoom: 14
        });
        // 搜索框自动完成功能
        AMap.plugin(['AMap.Autocomplete','AMap.PlaceSearch'], function(){
            let autoOptions = {
                input: that.$(".lego-search-input")[0]//使用联想输入的input的id
            };
            let autocomplete = new AMap.Autocomplete(autoOptions);
            let placeSearch = new AMap.PlaceSearch({
                map: that.map
            });
            AMap.event.addListener(autocomplete, "select", function(e){
                //针对选中的poi实现自己的功能
                placeSearch.search(e.poi.name);
            });
        });
        if(opts.data){
            that.map.getCity(function(data) {
                opts.data.city = data['city'];
                that.renderMap(opts.data);
            });
        }else{
            this.map.plugin('AMap.Geolocation', function() {
                geolocation = new AMap.Geolocation({
                    enableHighAccuracy: true,//是否使用高精度定位，默认:true
                    timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                    buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                    zoomToAccuracy: true,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
                    buttonPosition:'RB'
                });
                that.map.addControl(geolocation);
                geolocation.getCurrentPosition();
                AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
                AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
            });
            //解析定位结果
            function onComplete(result) {
                that.map.getCity(function(data) {
                    that.renderMap({
                        city: data['city'],
                        lng: result.position.getLng(),
                        lat: result.position.getLat()
                    });
                });
            }
            //解析定位错误信息
            function onError(data) {
                debug.warn(data);
            }
        }
    }
    renderMap(data = {}){
        let that = this,
            opts = this.options;
        if(opts.mapApi){
            AMap.plugin('AMap.Geocoder', function() {
                that.geocoder = new AMap.Geocoder();
                that.marker = new AMap.Marker({
                    map: that.map,
                    bubble: true
                });
                if(data.address){
                    that.getLocationByAddress(data.address);
                }else{
                    if(data.lng && data.lat){
                        that.marker.setPosition([data.lng, data.lat]);
                        let point = that.marker.getPosition();
                        that.map.setCenter(point);
                    }
                }
                that.map.on('click', function(e) {
                    that.marker.setPosition(e.lnglat);
                    that.geocoder.getAddress(e.lnglat, function(status, result) {
                        if (status == 'complete') {
                            let inputView = Lego.getView('#input_' + opts.vid);
                            let address = inputView.options.value = result.regeocode.formattedAddress;
                            that.map.getCity(function(data) {
                                opts.context.result = {
                                    address: address,
                                    province: data['province'],
                                    city: data['city'],
                                    area: data['district'],
                                    lng: e.lnglat.lng,
                                    lat: e.lnglat.lat
                                };
                            });
                        }
                    })
                });
            });
        }
    }
}
Lego.components('lego-maps', View);
export default View;
