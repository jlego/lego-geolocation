/**
 * 组件类: 地理位置选择器
 * 作者: yuronghui
 * 创建日期: 2017/5/29
 * data{address: '', province: '', city: '', area: '', lng: 0, lat: 0}
 */
import './asset/index.scss';
import MapView from './map';

class ComView extends Lego.UI.Baseview {
    constructor(opts = {}) {
        const options = {
            name: '',
            mapApi: Lego.config.mapApi,
            showInput: true,    //是否显示输入框
            readonly: false,
            locationMap: false,    //定位地图对象width, height
            showToolBar: false,
            placeholder: '请标注地理位置',
            data: {},
            value: {},
            onChange(){}
        };
        Object.assign(options, opts);
        if(options.value){
            options.data = typeof options.value == 'function' ? val(options.value) : options.value;
        }
        super(options);
        let that = this,
            option = this.options;
        Lego.loadScript(option.mapApi, function(){
            setTimeout(function(){
                if(option.locationMap && option.data.lng && option.data.lat) that.showLocationMap(option.data);
            }, 200);
        }, 'amap');
    }
    components(){
        let opts = this.options,
            that = this;
        if(opts.showInput){
            this.addCom({
                el: '#inputs_' + opts.vid,
                name: opts.name,
                disabled: opts.disabled,  //是否禁用状态，默认为 false
                readonly: opts.readonly,
                placeholder: opts.placeholder,
                size: opts.size,
                value: opts.data.address || '',
                nextAddon: hx`<i class="anticon anticon-environment-o"></i>`,
                onChange(self, value, event){
                    if(typeof opts.onChange == 'function') opts.onChange(that, value);
                }
            });
        }
    }
    render() {
        let opts = this.options;
        let vDom = hx`
        <div class="lego-geolocation">
            <input type="hidden" name="hidden_${opts.name}" id="lnglat_${opts.vid}" value="${[opts.data.lng, opts.data.lat].join(',')}">
            <inputs id="inputs_${opts.vid}"></inputs>
            ${opts.locationMap ? hx`<div class="lego-smallmap" id="locationMap_${opts.vid}" style="height: 250px;${!opts.readonly || !opts.data.lng || !opts.data.lat ? 'display:none;' : ''}"></div>` : ''}
        </div>
        `;
        return vDom;
    }
    renderAfter(){
        let opts = this.options,
            that = this;
        this.$('.input-group-addon').off().on('click', function(event){
            Lego.UI.modal({
                type: 'modal',
                title: '地图选址',
                content: hx`<lego-maps id="maps_${opts.vid}"></lego-maps>`,
                isMiddle: true,
                width: 700,
                height: 400,
                className: 'map-modal',
                scrollbar: null,
                components: [{
                    el: '#maps_' + opts.vid,
                    mapApi: opts.mapApi,
                    data(){
                        return opts.data;
                    }
                }],
                onOk(self){
                    opts.data = self.result || {};
                    self.close();
                    that.updateValue();
                    that.showLocationMap(opts.data);
                    setTimeout(function(){
                        that.$('input[name=' + opts.name + ']').valid();
                        if(typeof opts.onChange == 'function') opts.onChange(that, opts.data);
                    }, 200);
                }
            });
        });
        this.updateValue();
        if(opts.locationMap){
            let locationMapEl = this.$('#locationMap_' + opts.vid);
            if(locationMapEl.length){
                locationMapEl.css({
                    width: opts.locationMap.width,
                    height: opts.locationMap.height
                });
            }
        }
    }
    showLocationMap(data = {}){
        let opts = this.options;
        if(opts.locationMap){
            this.$('#locationMap_' + opts.vid).show();
            let mapOpts = {resizeEnable: true, zoom: 14, center: []};
            mapOpts.center[0] = data.lng || opts.locationMap.lng;
            mapOpts.center[1] = data.lat || opts.locationMap.lat;
            let map = new AMap.Map('locationMap_' + opts.vid, mapOpts);
            if(opts.showToolBar){
                map.plugin(["AMap.ToolBar"], function() {
                    map.addControl(new AMap.ToolBar());
                });
            }
            let marker = new AMap.Marker({
                position: mapOpts.center,
                map: map
            });
        }
    }
    updateValue(){
        let opts = this.options;
        if(opts.data){
            let input = this.$('#inputs_' + opts.vid).children('input'),
                lnglatInput = this.$('#lnglat_' + opts.vid);
            if(input.length) input.val(opts.data.address || '');
            if(lnglatInput.length) lnglatInput.val([opts.data.lng, opts.data.lat].join(',') || '');
        }
    }
}
Lego.components('geolocation', ComView);
export default ComView;
