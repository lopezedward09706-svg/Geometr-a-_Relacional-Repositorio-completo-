
from dataclasses import dataclass, field
from typing import Callable, Dict, List, Optional, Any
import json, os


@dataclass
class Quantity:
    name: str
    value: Any = None
    unit: str = ""
    status: str = "PENDIENTE"
    defined_by: str = ""
    notes: str = ""


@dataclass
class PendingItem:
    id: str
    question: str
    resolves_with: str
    status: str = "OPEN"
    resolution: str = ""


@dataclass
class Equation:
    id: str
    name: str
    formula: str
    estado: str
    provides: List[str]
    requires: List[str]
    compute: Optional[Callable] = None
    pending: List[PendingItem] = field(default_factory=list)
    capas: Dict[str, dict] = field(default_factory=dict)
    contradicciones: List[str] = field(default_factory=list)
    notes: str = ""


class RGEngine:
    def __init__(self, verbose: bool = True):
        self.equations = {}
        self.quantities = {}
        self.pendings = []
        self.verbose = verbose

    def add_equation(self, eq):
        if eq.id in self.equations:
            raise ValueError(f"Ecuacion {eq.id} ya registrada.")
        self.equations[eq.id] = eq
        self.pendings.extend(eq.pending)
        if self.verbose:
            print(f"[+] {eq.id} - {eq.name}  ({eq.estado})")
        self._try_compute(eq)
        self._resolve_pendings(eq.id)

    def status(self):
        return {
            "ecuaciones_registradas": list(self.equations.keys()),
            "total_ecuaciones": len(self.equations),
            "cantidades_disponibles": {
                n: {"value": q.value, "unit": q.unit,
                    "status": q.status, "defined_by": q.defined_by}
                for n, q in self.quantities.items()
            },
            "pendientes": [
                {"id": p.id, "question": p.question,
                 "resolves_with": p.resolves_with, "status": p.status,
                 "resolution": p.resolution}
                for p in self.pendings
            ],
            "pendientes_abiertos": sum(1 for p in self.pendings if p.status == "OPEN"),
            "pendientes_resueltos": sum(1 for p in self.pendings if p.status == "RESOLVED"),
        }

    def export_json(self, path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.status(), f, indent=2, ensure_ascii=False, default=str)
        if self.verbose:
            print(f"[->] Estado exportado: {path}")

    def _try_compute(self, eq):
        if eq.compute is None:
            return
        missing = [r for r in eq.requires if r not in self.quantities]
        if missing:
            if self.verbose:
                print(f"    (bloqueada: faltan {missing})")
            return
        try:
            result = eq.compute(self.quantities)
            for name, val in result.items():
                self.quantities[name] = Quantity(
                    name=name, value=val, status="DISPONIBLE",
                    defined_by=eq.id
                )
            if self.verbose:
                print(f"    computada: provee {list(result.keys())}")
        except Exception as e:
            if self.verbose:
                print(f"    error al computar: {e}")

    def _resolve_pendings(self, eq_id):
        for p in self.pendings:
            if p.resolves_with == eq_id and p.status == "OPEN":
                p.status = "RESOLVED"
                p.resolution = f"Resuelto por {eq_id}"
                if self.verbose:
                    print(f"    OK pendiente {p.id} resuelto por {eq_id}")
