$( document ).ready(function() {
    $("#mean1-interface").hide();
	$("#stdev1-interface").hide();
});

function GetZPercent(z) 
  {
    //z == number of standard deviations from the mean

    //if z is greater than 6.5 standard deviations from the mean
    //the number of significant digits will be outside of a reasonable 
    //range
    if ( z < -6.5)
      return 0;
    if( z > 6.5) 
      return 1;

    var factK = 1;
    var sum = 0;
    var term = 1;
    var k = 0;
    var loopStop = Math.exp(-23);
    while(Math.abs(term) > loopStop) 
    {
      term = .3989422804 * Math.pow(-1,k) * Math.pow(z,k) / (2 * k + 1) / Math.pow(2,k) * Math.pow(z,k+1) / factK;
      sum += term;
      k++;
      factK *= k;

    }
    sum += 0.5;

    return sum * 100;
  }


(function(){
	var demo = new Demo({
		ui: {
			mean1: {
				title: "\\( \\mu_{1} \\)",
				value: 0,
				range: [-10,10],
				color: "#5bccf6",
			},
			stdev1: {
				title: "\\( \\sigma_{1} \\)",
				value: 1,
				range: [0,3],
				color: "#5bccf6",
			},
			mean2: {
				title: "\\( \\mu_{2} \\)",
				value: 0,
				range: [-3,10],
				color: "#d8e750"
			},
			stdev2: {
				title: "\\( \\sigma_{2} \\)",
				value: 2,
				range: [0.30,5],
				color: "#d8e750"
			},
			xcoordinate1: {
				title: "x1",
				value: -1,
				range: [-5,0],
				color: "#FF0000"
			},
			xcoordinate2: {
				title: "x2",
				value: 1,
				range: [0,10],
				color: "#FF0000"
			}
		},

		init: function(){
			$("#demo").append("<div id='graph-container'></div>");
			var graph_dom = document.getElementById('graph-container');
			graph_dom.style.height =  2/3 * graph_dom.offsetWidth + "px";
		
			// First data series:
			d1 = [],
			d2 = [],
			d3 = [],
			d4 = [],
			d5 = [],
			d6 = []
			options = {
				xaxis: {
					minorTickFreq: 4
				},
				grid: {
				minorVerticalLines: true
				},
				show: true,
				fill: true,
				fillColor: "#5bccf6",
				fillBorder: true,
				fillOpacity: 1
			};
			this.update();
		},

		update: function(e){
			numPoints = 100;
			increment = (this.ui.stdev1.range[1] - this.ui.stdev1.range[0]) / numPoints;
			i = 0;
			// starting value for x
			start = -10;
			for (x = start; x < numPoints; x = x+increment) {
				d1[i] = [x, this.gaussian(x, this.ui.mean1.value, this.ui.stdev1.value)];
				d2[i] = [x, this.gaussian(x, this.ui.mean2.value, this.ui.stdev2.value)];
				i++;
			}
			var x1 = this.ui.xcoordinate1.value;
			var x2 = this.ui.xcoordinate2.value;
			var z1 = (x1-this.ui.mean2.value)/this.ui.stdev2.value;
			var z2 = (x2-this.ui.mean2.value)/this.ui.stdev2.value;
			var exponent1 = -0.5 * Math.pow(z1,2) / Math.pow(1,2);
			var y1 = Math.exp(exponent1)*(1/1) * (1/(Math.sqrt(2*Math.PI)));
			var exponent2 = -0.5 * Math.pow(z2,2) / Math.pow(1,2);
			var y2 = Math.exp(exponent2)*(1/1) * (1/(Math.sqrt(2*Math.PI)));
			var exponent3 = -0.5 * Math.pow(x1-this.ui.mean2.value,2) / Math.pow(this.ui.stdev2.value,2);
			var exponent4 = -0.5 * Math.pow(x2-this.ui.mean2.value,2) / Math.pow(this.ui.stdev2.value,2);
			var y3 = Math.exp(exponent3)*(1/this.ui.stdev2.value) * (1/(Math.sqrt(2*Math.PI)));
			var y4 = Math.exp(exponent4)*(1/this.ui.stdev2.value) * (1/(Math.sqrt(2*Math.PI)));
			//for z1 and z2
			d3 =[[z1,0],[z1,y1]]
			d4 =[[z2,0],[z2,y2]]
			//for x1 and x2
			d5 = [[x1,0]]
			d6 = [[x2,0]]
			i=0;
			for (x = 0; x < y3; x = x+0.01) {
				d5[i] = [x1,x];
				i++;
			}
			i=0;
			for (x = 0; x < y4; x = x+0.01) {
				d6[i] = [x2,x];
				i++;
			}
			
			data = [
				{data : d1,lines:{fill: true}},
				{data : d2},
				{data : d3,label: 'Z1', color: 'black', lines:{show: true}},
				{data : d4,label: 'Z2', color: 'black', lines:{show: true} },
				{data : d5,label: 'X1', color: 'red', points:{show: true,radius: 1}},
				{data : d6,label: 'X2', color: 'red', points:{show: true,radius: 1}}
			];
			$("#z1value").text(z1);
			$("#z2value").text(z2);
			$("#z1pvalue").text(calc_z(z1));
			$("#z2pvalue").text(calc_z(z2));
			var total = parseFloat(calc_z(z1)) + parseFloat( calc_z(z2));
			//console.log(total);
			$("#zpvaluetotal").text(trimfloat(total,6));
			// Draw Graph
			graph = Flotr.draw(document.getElementById("graph-container"), data, {
				legend : {
					position : 'ne',            // Position the legend 'south-east'.
					backgroundColor : '#D2E8FF' // A light blue background color.
				},
				shadowSize: 0,
				fill: 1,
				HtmlText: false,
				fontSize: 10,
				yaxis : {
					title: "f(x,μ,σ)",
					titleAngle: 90,
					showLables: true,
					max: 0.6,
					min: 0,
				},
				preventDefault: false, //allows scrolling on touch screen devices instead of preventing scrolling
				xaxis : {
					title: "x",
					showLabels: true,
					max: 10,
					min: -5,
					noTicks: 12,
					minorTickFreq: 1
				},
				grid : {
					minorVerticalLines: true,
					minorHorizontalLines: true
				},
				mouse : {
					track:true,
					sensibility: 10,
					radius: 5,
					trackDecimals: 3
				}
			});
		},

		gaussian: function(x, mean, stdev){
			var exponent = -0.5 * Math.pow(x-mean,2) / Math.pow(stdev,2);
			return Math.exp(exponent)*(1/stdev) * (1/(Math.sqrt(2*Math.PI)));
		}
	});


})();