/**
 * 组件类: 地理位置选择器
 * 作者: yuronghui
 * 创建日期: 2017/5/29
 * data{address: '', lng: 0, lat: 0}
 */
import './asset/index.scss';
import MapView from './map';

class ComView extends Lego.UI.Baseview {
    constructor(opts = {}) {
        const options = {
            name: '',
            mapApi: '',
            placeholder: '请标注地理位置',
            data: {},
            onChange(){}
        };
        Object.assign(options, opts);
        super(options);
    }
    components(){
        let opts = this.options,
            that = this;
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
    render() {
        let opts = this.options;
        let vDom = hx`
        <div class="lego-geolocation">
            <input type="hidden" name="hidden_${opts.name}" id="lnglat_${opts.vid}" value="${opts.data.lnglat}">
            <inputs id="inputs_${opts.vid}"></inputs>
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
                content: hx`<maps id="maps_${opts.vid}"></maps>`,
                isMiddle: true,
                width: 700,
                height: 400,
                className: 'map-modal',
                components: [{
                    el: '#maps_' + opts.vid,
                    mapApi: opts.mapApi,
                    data: function(){
                        return opts.data;
                    }
                }],
                onOk(self){
                    opts.data = self.result || {};
                    self.close();
                    that.updateValue();
                }
            });
        });
        this.updateValue();
    }
    updateValue(){
        let opts = this.options;
        if(opts.data){
            let input = this.$('#inputs_' + opts.vid).children('input'),
                lnglatInput = this.$('#lnglat_' + opts.vid);
            if(input.length) input.val(opts.data.address || '');
            if(lnglatInput.length) lnglatInput.val(opts.data.lnglat || '');
        }
    }
}
Lego.components('geolocation', ComView);
export default ComView;
