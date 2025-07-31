import "./style.css";
import { Network, DataSet } from "vis-network/standalone/esm/vis-network.js";
import type {
  Node,
  Edge,
  Options,
  IdType,
} from "vis-network/standalone/esm/vis-network.js";

interface NoArvore extends Node {
  category?: string;
  name?: string;
  level?: number;
  parentId?: IdType;
}

const nos = new DataSet<NoArvore, "id">([]);
const arestas = new DataSet<Edge>([]);

let contadorIdNo: number = 1;
let nivelMaximo: number = 0;
let noSelecionadoId: IdType | null = null;

const container = document.getElementById("graph-container") as HTMLDivElement;

const dados = {
  nodes: nos,
  edges: arestas,
};

const options: Options = {
  nodes: {
    shape: "box",
    size: 30,
    font: {
      size: 16,
      color: "#ffffff",
      face: "Segoe UI, Arial, sans-serif",
      strokeWidth: 1,
      strokeColor: "#000000",
    },
    borderWidth: 3,
    shadow: {
      enabled: true,
      color: "rgba(0,0,0,0.3)",
      size: 5,
      x: 2,
      y: 2,
    },
  },
  edges: {
    width: 2,
    color: {
      color: "#848484",
      highlight: "#646cff",
    },
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 1,
      },
    },
    smooth: {
      enabled: true,
      type: "continuous",
      roundness: 0.5,
    },
  },
  layout: {
    hierarchical: {
      enabled: true,
      direction: "UD",
      sortMethod: "directed",
      levelSeparation: 150,
      nodeSpacing: 100,
    },
  },
  physics: {
    enabled: false,
  },
  interaction: {
    tooltipDelay: 200,
    hideEdgesOnDrag: true,
    selectConnectedEdges: true,
  },
};

const network = new Network(container, dados, options);

function showModal(title: string, message: string): void {
  const modal = document.getElementById("custom-modal") as HTMLDivElement;
  const modalTitle = document.getElementById(
    "modal-title"
  ) as HTMLHeadingElement;
  const modalText = document.getElementById(
    "modal-text"
  ) as HTMLParagraphElement;

  modalTitle.textContent = title;
  modalText.textContent = message;
  modal.style.display = "block";

  modal.focus();
}

function hideModal(): void {
  const modal = document.getElementById("custom-modal") as HTMLDivElement;
  modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("custom-modal") as HTMLDivElement;
  const closeBtn = document.querySelector(".modal-close") as HTMLSpanElement;
  const okBtn = document.getElementById("modal-ok-btn") as HTMLButtonElement;

  closeBtn.addEventListener("click", hideModal);

  okBtn.addEventListener("click", hideModal);

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      hideModal();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.style.display === "block") {
      hideModal();
    }
  });
});

network.on("click", function (params) {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0];
    const node = nos.get(nodeId) as NoArvore;
    if (node) {
      const parentInput = document.getElementById(
        "parent-input"
      ) as HTMLInputElement;
      parentInput.value = node.id?.toString() || "";

      selecionarNoParaExclusao(nodeId);

      console.log(`Nó selecionado: ${node.name} (ID: ${node.id})`);
    }
  } else {
    desselecionarNo();
  }
});

function criarNoRaiz() {
  nos.clear();
  arestas.clear();

  contadorIdNo = 1;
  nivelMaximo = 0;
  noSelecionadoId = null;

  const rootNode: NoArvore = {
    id: contadorIdNo++,
    label: "Escolhas de Roupa",
    level: 0,
    color: getColorByLevel(0),
  };

  nivelMaximo = 0;
  nos.add(rootNode);

  showModal("Sucesso", "Nó raiz criado com sucesso!");
}

function adicionarItem(): void {
  const parentInput = document.getElementById(
    "parent-input"
  ) as HTMLInputElement;
  const categoryInput = document.getElementById(
    "category-input"
  ) as HTMLInputElement;
  const nameInput = document.getElementById("name-input") as HTMLInputElement;

  const parentIdentifier = parentInput.value.trim();
  const category = categoryInput.value.trim();
  const name = nameInput.value.trim();

  if (!category || !name) {
    showModal("Erro", "Por favor, preencha a categoria e o nome!");
    return;
  }

  let parentNode: NoArvore | null = null;

  if (parentIdentifier) {
    const allNodes = nos.get() as NoArvore[];
    parentNode =
      allNodes.find(
        (node) =>
          node.id?.toString() === parentIdentifier ||
          node.name?.toLowerCase() === parentIdentifier.toLowerCase()
      ) || null;

    if (!parentNode) {
      showModal("Erro", "Nó pai não encontrado! Use o ID ou nome exato.");
      return;
    }
  } else {
    const allNodes = nos.get() as NoArvore[];
    parentNode = allNodes.find((node) => node.category === "root") || null;

    if (!parentNode) {
      criarNoRaiz();
      const allNodesUpdated = nos.get() as NoArvore[];
      parentNode =
        allNodesUpdated.find((node) => node.category === "root") || null;
    }
  }

  if (!parentNode) {
    showModal("Erro", "Erro ao encontrar nó pai!");
    return;
  }

  const newLevel = (parentNode.level || 0) + 1;
  nivelMaximo = Math.max(nivelMaximo, newLevel);

  const newNode: NoArvore = {
    id: contadorIdNo++,
    label: `${category}\n${name}`,
    category: category,
    name: name,
    level: newLevel,
    parentId: parentNode.id,
    color: {
      background: getColorByLevel(newLevel),
      border: "#1f2937",
    },
  };

  nos.add(newNode);

  const newEdge: Edge = {
    from: parentNode.id,
    to: newNode.id,
  };
  arestas.add(newEdge);

  console.log(
    `Item "${name}" (${category}) adicionado como filho de "${parentNode.name}"`
  );

  parentInput.value = "";
  categoryInput.value = "";
  nameInput.value = "";
}

function getColorByLevel(level: number): string {
  const colors = [
    "#7c3aed", // Nível 0 - Roxo vibrante
    "#059669", // Nível 1 - Verde esmeralda
    "#dc2626", // Nível 2 - Vermelho vibrante
    "#2563eb", // Nível 3 - Azul vibrante
    "#ea580c", // Nível 4 - Laranja vibrante
    "#0891b2", // Nível 5 - Ciano vibrante
  ];
  return colors[level % colors.length];
}

function contarEListarCombinacoes(): void {
  const allNodes = nos.get() as NoArvore[];
  const leafNodes = allNodes.filter((node) => {
    const hasChildren = arestas.get().some((edge) => edge.from === node.id);
    return !hasChildren && node.category !== "root";
  });

  if (leafNodes.length === 0) {
    showModal("Aviso", "Não há caminhos completos na árvore!");
    return;
  }

  const allPaths: NoArvore[][] = [];

  leafNodes.forEach((leaf) => {
    const path = obterCaminhoParaRaiz(leaf, allNodes);
    allPaths.push(path);
  });

  const combinationsText = allPaths
    .map((path, index) => {
      const pathDescription = path
        .reverse()
        .slice(1)
        .map((node) => `${node.category}: ${node.name}`)
        .join(" + ");
      return `${index + 1}. ${pathDescription}`;
    })
    .join("\n");

  destacarTodosCaminhos(allPaths);

  showModal(
    "Todas as Combinações",
    `Total de combinações possíveis: ${allPaths.length}\n\nTodas as combinações:\n${combinationsText}`
  );
}

function analisarComplexidade(): void {
  const allNodes = nos.get() as NoArvore[];
  const leafNodes = allNodes.filter((node) => {
    const hasChildren = arestas.get().some((edge) => edge.from === node.id);
    return !hasChildren && node.category !== "root";
  });

  if (leafNodes.length === 0) {
    showModal("Aviso", "Não há caminhos completos na árvore!");
    return;
  }

  let simplestPath: NoArvore[] = [];
  let complexPath: NoArvore[] = [];
  let shortestLength = Infinity;
  let longestLength = 0;

  leafNodes.forEach((leaf) => {
    const path = obterCaminhoParaRaiz(leaf, allNodes);
    if (path.length < shortestLength) {
      shortestLength = path.length;
      simplestPath = path;
    }
    if (path.length > longestLength) {
      longestLength = path.length;
      complexPath = path;
    }
  });

  destacarCaminhosComplexidade(simplestPath, complexPath);

  const simplestDescription = simplestPath
    .reverse()
    .slice(1)
    .map((node) => `${node.category}: ${node.name}`)
    .join(" + ");

  const complexDescription = complexPath
    .reverse()
    .slice(1)
    .map((node) => `${node.category}: ${node.name}`)
    .join(" + ");

  showModal(
    "Análise de Complexidade",
    `🟢 LOOK MAIS SIMPLES (${
      shortestLength - 1
    } escolhas):\n${simplestDescription}\n\n` +
      `🔴 LOOK MAIS COMPLEXO (${
        longestLength - 1
      } escolhas):\n${complexDescription}\n\n` +
      `Diferença: ${longestLength - shortestLength} escolhas adicionais`
  );
}

function obterCaminhoParaRaiz(
  node: NoArvore,
  allNodes: NoArvore[]
): NoArvore[] {
  const path: NoArvore[] = [node];
  let currentNode = node;

  while (currentNode.parentId) {
    const parent = allNodes.find((n) => n.id === currentNode.parentId);
    if (parent) {
      path.push(parent);
      currentNode = parent;
    } else {
      break;
    }
  }

  return path;
}

function destacarTodosCaminhos(paths: NoArvore[][]): void {
  redefinirDestaque();

  const colors = ["#ff6b6b", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];

  paths.forEach((path, index) => {
    const color = colors[index % colors.length];

    path.forEach((node) => {
      nos.update({
        id: node.id,
        color: {
          background: color,
          border: "#1f2937",
        },
      });
    });

    destacarArestasParaCaminho(path, color);
  });
}

function destacarCaminhosComplexidade(
  simplestPath: NoArvore[],
  complexPath: NoArvore[]
): void {
  redefinirDestaque();

  simplestPath.forEach((node) => {
    nos.update({
      id: node.id,
      color: {
        background: "#10b981",
        border: "#065f46",
      },
    });
  });

  complexPath.forEach((node) => {
    nos.update({
      id: node.id,
      color: {
        background: "#ef4444",
        border: "#991b1b",
      },
    });
  });

  destacarArestasParaCaminho(simplestPath, "#10b981");
  destacarArestasParaCaminho(complexPath, "#ef4444");
}

function redefinirDestaque(): void {
  const allNodes = nos.get() as NoArvore[];
  allNodes.forEach((node) => {
    nos.update({
      id: node.id,
      color: {
        background: getColorByLevel(node.level || 0),
        border: "#1f2937",
      },
    });
  });

  const allEdges = arestas.get();
  allEdges.forEach((edge) => {
    arestas.update({
      id: edge.id,
      color: {
        color: "#848484",
        highlight: "#646cff",
      },
    });
  });
}

function destacarArestasParaCaminho(
  path: NoArvore[],
  color: string = "#ff6b6b"
): void {
  const allEdges = arestas.get();

  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = path[i + 1]; // Pai
    const toNode = path[i]; // Filho

    const edge = allEdges.find(
      (e) => e.from === fromNode.id && e.to === toNode.id
    );
    if (edge) {
      arestas.update({
        id: edge.id,
        color: {
          color: color,
          highlight: color,
        },
      });
    }
  }
}

function redefinirGrafo(): void {
  nos.clear();
  arestas.clear();
  contadorIdNo = 1;
  nivelMaximo = 0;
  console.log("Grafo resetado!");
}

function centralizarGrafo(): void {
  network.fit({
    animation: {
      duration: 800,
      easingFunction: "easeInOutQuad",
    },
  });
  console.log("Gráfico centralizado!");
}

function selecionarNoParaExclusao(nodeId: IdType): void {
  if (noSelecionadoId) {
    const prevNode = nos.get(noSelecionadoId) as NoArvore;
    if (prevNode) {
      nos.update({
        id: noSelecionadoId,
        borderWidth: 3,
        color: {
          background: getColorByLevel(prevNode.level || 0),
          border: "#1f2937",
        },
      });
    }
  }

  noSelecionadoId = nodeId;
  const node = nos.get(nodeId) as NoArvore;

  if (node) {
    nos.update({
      id: nodeId,
      borderWidth: 6,
      color: {
        background: getColorByLevel(node.level || 0),
        border: "#ff6b6b",
      },
    });

    const deleteBtn = document.getElementById(
      "delete-item-btn"
    ) as HTMLButtonElement;
    deleteBtn.disabled = false;
    deleteBtn.textContent = `Excluir: ${node.name}`;
  }
}

function desselecionarNo(): void {
  if (noSelecionadoId) {
    const node = nos.get(noSelecionadoId) as NoArvore;
    if (node) {
      nos.update({
        id: noSelecionadoId,
        borderWidth: 3,
        color: {
          background: getColorByLevel(node.level || 0),
          border: "#1f2937",
        },
      });
    }
  }

  noSelecionadoId = null;

  const deleteBtn = document.getElementById(
    "delete-item-btn"
  ) as HTMLButtonElement;
  deleteBtn.disabled = true;
  deleteBtn.textContent = "Excluir Item Selecionado";
}

function excluirItemSelecionado(): void {
  if (!noSelecionadoId) {
    showModal(
      "Aviso",
      "Nenhum item selecionado! Clique em um nó da árvore primeiro."
    );
    return;
  }

  const nodeToDelete = nos.get(noSelecionadoId) as NoArvore;

  if (!nodeToDelete) {
    showModal("Erro", "Nó não encontrado!");
    return;
  }

  if (nodeToDelete.category === "root") {
    showModal("Erro", "Não é possível excluir o nó raiz!");
    return;
  }

  const hasChildren = arestas
    .get()
    .some((edge) => edge.from === noSelecionadoId);

  if (hasChildren) {
    showModal(
      "Confirmação",
      `O item "${nodeToDelete.name}" possui sub-itens. Ao excluí-lo, todos os sub-itens também serão removidos. Deseja continuar?`
    );

    setTimeout(() => {
      if (confirm("Confirma a exclusão?")) {
        executarExclusao(noSelecionadoId!);
      }
    }, 500);
  } else {
    executarExclusao(noSelecionadoId);
  }
}

function executarExclusao(nodeId: IdType): void {
  const nodeToDelete = nos.get(nodeId) as NoArvore;

  if (!nodeToDelete) return;

  const nodesToDelete: IdType[] = [];
  const edgesToDelete: IdType[] = [];

  function collectDescendants(parentId: IdType): void {
    nodesToDelete.push(parentId);

    const childEdges = arestas.get({
      filter: (edge) => edge.from === parentId,
    });

    childEdges.forEach((edge) => {
      edgesToDelete.push(edge.id!);
      if (edge.to) {
        collectDescendants(edge.to);
      }
    });
  }

  collectDescendants(nodeId);

  const parentEdge = arestas.get({
    filter: (edge) => edge.to === nodeId,
  });

  parentEdge.forEach((edge) => {
    edgesToDelete.push(edge.id!);
  });

  arestas.remove(edgesToDelete);
  nos.remove(nodesToDelete);

  noSelecionadoId = null;
  const deleteBtn = document.getElementById(
    "delete-item-btn"
  ) as HTMLButtonElement;
  deleteBtn.disabled = true;
  deleteBtn.textContent = "Excluir Item Selecionado";

  showModal(
    "Sucesso",
    `Item "${nodeToDelete.name}" e seus sub-itens foram excluídos com sucesso!`
  );
  console.log(
    `Item excluído: ${nodeToDelete.name} e ${
      nodesToDelete.length - 1
    } sub-itens`
  );
}

function createDefaultExamples(): void {
  criarNoRaiz();

  setTimeout(() => {
    adicionarNoExemplo("1", "Blusa", "Opções de Blusa");
    adicionarNoExemplo("1", "Calça", "Opções de Calça");
    adicionarNoExemplo("1", "Sapato", "Opções de Sapato");

    setTimeout(() => {
      adicionarNoExemplo("2", "Blusa", "Rosa");
      adicionarNoExemplo("2", "Blusa", "Amarela");
      adicionarNoExemplo("2", "Blusa", "Azul");

      adicionarNoExemplo("3", "Calça", "Jeans");
      adicionarNoExemplo("3", "Calça", "Social");

      adicionarNoExemplo("4", "Sapato", "Tênis");
      adicionarNoExemplo("4", "Sapato", "Social");
      adicionarNoExemplo("4", "Sapato", "Bota");
    }, 100);
  }, 50);
}

function adicionarNoExemplo(
  parentId: string,
  category: string,
  name: string
): void {
  const allNodes = nos.get() as NoArvore[];
  const parentNode = allNodes.find((node) => node.id?.toString() === parentId);

  if (!parentNode) {
    console.log(`Nó pai ${parentId} não encontrado para ${category}: ${name}`);
    return;
  }

  const newLevel = (parentNode.level || 0) + 1;
  nivelMaximo = Math.max(nivelMaximo, newLevel);

  const newNode: NoArvore = {
    id: contadorIdNo++,
    label: `${category}\n${name}`,
    category: category,
    name: name,
    level: newLevel,
    parentId: parentNode.id,
    color: {
      background: getColorByLevel(newLevel),
      border: "#1f2937",
    },
  };

  nos.add(newNode);

  const newEdge: Edge = {
    from: parentNode.id,
    to: newNode.id,
  };
  arestas.add(newEdge);

  console.log(`Exemplo adicionado: ${category} - ${name} (Nível ${newLevel})`);
}

(document.getElementById("add-item-btn") as HTMLButtonElement).addEventListener(
  "click",
  adicionarItem
);

(
  document.getElementById("delete-item-btn") as HTMLButtonElement
).addEventListener("click", excluirItemSelecionado);

(
  document.getElementById("count-combinations-btn") as HTMLButtonElement
).addEventListener("click", contarEListarCombinacoes);

(
  document.getElementById("analyze-complexity-btn") as HTMLButtonElement
).addEventListener("click", analisarComplexidade);

(document.getElementById("reset-btn") as HTMLButtonElement).addEventListener(
  "click",
  redefinirGrafo
);

(document.getElementById("center-btn") as HTMLButtonElement).addEventListener(
  "click",
  centralizarGrafo
);

(
  document.getElementById("load-examples-btn") as HTMLButtonElement
).addEventListener("click", function () {
  redefinirGrafo();
  setTimeout(() => createDefaultExamples(), 100);
});

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    const activeElement = document.activeElement;
    const isInputField =
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.getAttribute("contenteditable") === "true");

    if (!isInputField) {
      event.preventDefault();
      centralizarGrafo();
    }
  }
});

createDefaultExamples();

document.addEventListener("DOMContentLoaded", function () {
  const deleteBtn = document.getElementById(
    "delete-item-btn"
  ) as HTMLButtonElement;
  deleteBtn.disabled = true;
});
