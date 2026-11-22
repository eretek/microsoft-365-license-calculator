/*! Eretek Online Araçlar #41 — Microsoft 365 Lisans İhtiyacı Hesaplayıcı */
ERT.def('41', {
	run: function (v, c) {
		var need = {}, order = [];
		var add = function (sku, n) { sku = sku.trim(); if (!sku) { return; } var k = sku.toLowerCase(); if (!need[k]) { need[k] = { sku: sku, n: 0 }; order.push(k); } need[k].n += n; };
		c.lines(v.roles, 500, 'roles').forEach(function (l, i) {
			var p = l.split(';').map(function (x) { return x.trim(); }), n = ERT.parseNum(p[1], 'en');
			if (p.length < 3 || !(n >= 0) || Math.floor(n) !== n || !p[2]) { throw c.fe('roles', 'rowFmt', { r: i + 1 }); }
			add(p[2], n); (p[3] || '').split(',').forEach(function (x) { add(x, n); });
		});
		var have = {};
		c.lines(v.have || '', 500, 'have').forEach(function (l, i) {
			var p = l.split(';').map(function (x) { return x.trim(); }), n = ERT.parseNum(p[1], 'en'), pr = p[2] ? ERT.parseNum(p[2], c.lang) : null;
			if (!p[0] || !(n >= 0) || Math.floor(n) !== n || (p[2] && isNaN(pr))) { throw c.fe('have', 'rowFmt2', { r: i + 1 }); }
			have[p[0].toLowerCase()] = { n: n, price: pr, sku: p[0] };
			if (!need[p[0].toLowerCase()]) { need[p[0].toLowerCase()] = { sku: p[0], n: 0 }; order.push(p[0].toLowerCase()); }
		});
		var rows = [], cls = [], cost = 0, costKnown = true, gaps = {};
		order.forEach(function (k) {
			var h = have[k] || { n: 0, price: null }, gap = need[k].n - h.n, cc = gap > 0 && h.price !== null ? gap * h.price : null;
			if (gap > 0 && h.price === null) { costKnown = false; }
			if (cc) { cost += cc; }
			gaps[need[k].sku] = gap;
			rows.push([need[k].sku, need[k].n, h.n, gap > 0 ? gap : 0, gap < 0 ? -gap : 0, h.price === null ? '–' : c.n(h.price, 2), cc === null ? '–' : c.n(cc, 2)]);
			cls.push(gap > 0 ? 'err' : (gap < 0 ? 'warn' : 'ok'));
		});
		var msgs = [['info', c.t('priceNote')]]; if (!costKnown) { msgs.push(['warn', c.t('noPrice')]); }
		var biz = order.filter(function (k) { return /business\s*(basic|standard|premium)/i.test(need[k].sku); }).reduce(function (s, k) { return s + Math.max(need[k].n, (have[k] || { n: 0 }).n); }, 0);
		if (biz > 300) { msgs.push(['err', c.t('bizCap', { n: biz })]); }
		var cols = [c.t('c_sku'), c.t('c_need'), c.t('c_have'), c.t('c_gap'), c.t('c_extra'), c.t('c_price'), c.t('c_cost')];
		return { big: c.t('big', { n: rows.filter(function (r) { return r[3] > 0; }).length }), kv: [[c.t('totCost', { cur: v.cur || '' }), costKnown ? c.n(cost, 2) + ' ' + (v.cur || '') : c.t('partial', { c: c.n(cost, 2) + ' ' + (v.cur || '') })]], msgs: msgs, tables: [{ cols: cols, rows: rows, cls: cls }], x: { csv: { name: 'm365-licenses', cols: cols, rows: rows } }, v: { gaps: gaps } };
	}
});
