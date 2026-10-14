"use strict";

const _pinchPtrs = new Map();
let _pinch = null;
function _pinchPair() {
  return Array.from(_pinchPtrs.values());
}
function _pinchDist() {
  const a = _pinchPair();
  return Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
}
function _pinchMid() {
  const a = _pinchPair();
  return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2 };
}
svg.addEventListener(
  "pointerdown",
  (e) => {
    if (e.pointerType !== "touch") return;
    _pinchPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (_pinchPtrs.size !== 2) return;
    if (linking) {
      try {
        linking.ghost.remove();
      } catch (_) {}
      linking = null;
    }
    if (drag) {
      const de = (drag.note ? noteEls : nodeEls)[drag.id];
      if (de) de.classList.remove("dragging");
      drag = null;
    }
    pan = null;
    _pinch = { d: _pinchDist(), vb: getVB(), mid: _pinchMid() };
  },
  true,
);
svg.addEventListener(
  "pointermove",
  (e) => {
    if (e.pointerType !== "touch" || !_pinchPtrs.has(e.pointerId)) return;
    _pinchPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (!_pinch || _pinchPtrs.size !== 2) return;
    const d = _pinchDist();
    if (!(d > 0)) return;
    const vb = _pinch.vb;
    let nw = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, vb.w * (_pinch.d / d)));
    const f = nw / vb.w;
    const r = svg.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const ax = vb.x + ((_pinch.mid.x - r.left) / r.width) * vb.w,
      ay = vb.y + ((_pinch.mid.y - r.top) / r.height) * vb.h;
    setVB(ax - (ax - vb.x) * f, ay - (ay - vb.y) * f, nw, vb.h * f);
  },
  true,
);
const _pinchEnd = (e) => {
  if (e.pointerType !== "touch") return;
  _pinchPtrs.delete(e.pointerId);
  if (_pinchPtrs.size < 2) _pinch = null;
};
svg.addEventListener("pointerup", _pinchEnd, true);
svg.addEventListener("pointercancel", _pinchEnd, true);

const LP_MS = 500,
  LP_TOL = 10;
let _lp = null;
function _lpCancel() {
  if (_lp) {
    clearTimeout(_lp.t);
    _lp = null;
  }
}
svg.addEventListener(
  "pointerdown",
  (e) => {
    if (e.pointerType !== "touch") {
      _lpCancel();
      return;
    }
    if (_pinch || _pinchPtrs.size > 1) {
      _lpCancel();
      return;
    }
    if (e.target.closest(".port,.port-hit")) return;
    const nodeEl = e.target.closest(".node");
    const hitEl = nodeEl ? null : e.target.closest(".link-hit");
    if (!nodeEl && !hitEl) return;
    const id = nodeEl
      ? nodeEl.getAttribute("data-id")
      : hitEl.getAttribute("data-link-hit");
    const isNode = !!nodeEl,
      pid = e.pointerId;
    _lpCancel();
    _lp = {
      x: e.clientX,
      y: e.clientY,
      pointerId: pid,
      t: setTimeout(() => {
        if (!_lp) return;
        const X = _lp.x,
          Y = _lp.y;
        _lp = null;

        if (drag) {
          const de = (drag.note ? noteEls : nodeEls)[drag.id];
          if (de) de.classList.remove("dragging");
          drag = null;
        }
        if (linking) {
          try {
            linking.ghost.remove();
          } catch (_) {}
          linking = null;
        }
        pan = null;
        try {
          svg.releasePointerCapture(pid);
        } catch (_) {}
        if (isNode) showCtx(X, Y, id);
        else showCtxLink(X, Y, id);
      }, LP_MS),
    };
  },
  true,
);
svg.addEventListener(
  "pointermove",
  (e) => {
    if (!_lp || e.pointerId !== _lp.pointerId) return;
    if (
      Math.abs(e.clientX - _lp.x) > LP_TOL ||
      Math.abs(e.clientY - _lp.y) > LP_TOL
    )
      _lpCancel();
  },
  true,
);
svg.addEventListener("pointerup", _lpCancel, true);
svg.addEventListener("pointercancel", _lpCancel, true);
