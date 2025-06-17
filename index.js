module.exports = function(RED) {
    function LithumToPercentNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;

        /*
        console.log("nodesssssssssssssss");
        console.log(node);

        console.log("configsssssssssssssss");
        console.log(config);
        */

        function mapIt(x, in_min, in_max, out_min, out_max) {
            x = parseFloat(x);
            in_min = parseFloat(in_min);
            in_max = parseFloat(in_max);
            out_min = parseFloat(out_min);
            out_max = parseFloat(out_max);
            return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
        }

        
        function get_percents_from_volts( volts,cellsCount ){

            percent = 0.00;
            volts = parseFloat( volts ) / parseFloat(cellsCount); // 4 cells in the 12v pack
            
            if( config.litype == "lifepo4" ){
                li_voltage_to_percentage = [
                    [10.00,999],
                    [3.65, 100],
                    [3.40, 90],
                    [3.35, 80],
                    [3.32, 70],
                    [3.30, 60],
                    [3.27, 50],
                    [3.20, 40],
                    [3.15, 30],
                    [3.10, 20],
                    [3.05, 10],
                    [3.00, 5],
                    [2.80, 0],
                    [0.00,-999]
                ];
            }else{
                li_voltage_to_percentage = [
                    [10.00,999],
                    [4.20, 100],
                    [4.06, 90],
                    [3.98, 80],
                    [3.92, 70],
                    [3.87, 60],
                    [3.82, 50],
                    [3.79, 40],
                    [3.77, 30],
                    [3.74, 20],
                    [3.68, 10],
                    [3.45, 5],
                    [3.00, 0],
                    [0.00,-999]
                ];
            }
            li_voltage_to_percentage_len = li_voltage_to_percentage.length;
            mmax = li_voltage_to_percentage[0];
            mmin = li_voltage_to_percentage[1];
        
            for(i=0,ic=li_voltage_to_percentage_len-2; i<ic; i++){
                if( volts <= parseFloat(li_voltage_to_percentage[i][0]) &&
                    volts >= parseFloat(li_voltage_to_percentage[i+1][0]) ){
                    mmax = li_voltage_to_percentage[i];
                    mmin = li_voltage_to_percentage[i+1];
                    //min = i;
                    break;
                }
            }
        
            percent = mapIt( volts, mmin[0], mmax[0], mmin[1],mmax[1] );
            
            //return 'volts:'+volts+' range:'+min+' max:';//percent;
            return percent;
        }
        

       
        node.on('input', function(msg) {

            msg.payload = get_percents_from_volts( msg.payload, config.cellno); 
            msg['cellno'] = config.cellno;
            msg['litype'] = config.litype;
            if( config.topic != undefined )
                msg['topic'] = config.topic;
            //msg.payload*2.5;
            node.send(msg);
       
             mfill = "green";
            if( msg.payload <= 10 || msg.payload >= 90 )
                mfill = "red";
            node.status({
                fill: mfill,   
                shape:"ring",
                text: msg.payload.toFixed(2)+"%"
            });

        });
    }
    RED.nodes.registerType("lithum-to-percent",LithumToPercentNode);
}