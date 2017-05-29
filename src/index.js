/**
 * 组件类: 地理位置选择器
 * 作者: yuronghui
 * 创建日期: 2017/5/29
 */
import './asset/index.scss';

class ComView extends Lego.UI.Baseview {
    constructor(opts = {}) {
        const options = {
            rootId: 0,
            fieldName: 'key',
            name: ['province', 'city', 'area'], //表单域名称 国家country, 省province, 市city, 区area
            placeholder: ['请选择省份', '请选择城市', '请选择区域'],
            value: [],
            selectOpts: {},
            onChange(){}
        };
        Object.assign(options, opts);
        super(options);
    }
    components(){
        let opts = this.options,
            that = this;
        if(opts.data){
            function filterData(pId){
                let newData = [],
                    data = opts.data[pId];
                for(let key in data){
                    newData.push({
                        key: key,
                        value: data[key]
                    });
                }
                return newData;
            }
            function updateSelect(name, parentId){
                let index = opts.name.indexOf(name),
                    theData = filterData(parentId);
                if(index > -1){
                    let selectsView = Lego.getView('#selects_' + name);
                    if(selectsView){
                        selectsView.options.value = [];
                        selectsView.options.data = theData;
                        selectsView.refresh();
                        // if(!theData.length){
                        //     selectsView.$el.hide();
                        // }else{
                        //     selectsView.$el.show();
                        // }
                        updateSelect(opts.name[index + 1], 0);
                    }
                }
            }
            opts.name.forEach((value, index) => {
                that.addCom(Object.assign({
                    el: '#selects_' + value,
                    name: value,
                    fieldName: opts.fieldName,
                    placeholder: opts.placeholder[index],
                    data: !index ? filterData(opts.rootId) : [],
                    onChange(self, result) {
                        updateSelect(opts.name[index + 1], result.key);
                        if(typeof opts.onChange == 'function') opts.onChange(that, result);
                    }
                }, opts.selectOpts));
            });
        }
    }
    render() {
        let opts = this.options,
            vDom = hx`<div></div>`;
        if(opts.data){
            vDom = hx`
            <div class="lego-area-picker">
                ${opts.name.map(value => hx`<selects id="selects_${value}"></selects>`)}
            </div>
            `;
        }
        return vDom;
    }
}
Lego.components('geolocation', ComView);
export default ComView;
