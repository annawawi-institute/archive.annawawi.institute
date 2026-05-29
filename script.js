const ENDPOINT = 'https://opensheet.elk.sh/18vIyTo366EkSMWGnHyXjaqn1HSTvv3FZeNnTBclpt5w/_EXPORT';

let allData = [];

const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const userFilter = document.getElementById('userFilter');
const categoryFilter = document.getElementById('categoryFilter');
const sortDate = document.getElementById('sortDate');

async function loadData(){

    try{

        const response = await fetch(ENDPOINT);
        const data = await response.json();

        allData = data.sort((a,b) =>
            Number(a.number || 0) - Number(b.number || 0)
        );

        populateCategoryFilter(allData);

        renderTable();

    }catch(error){

        tableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    Failed to load data
                </td>
            </tr>
        `;

        console.error(error);
    }
}

function populateCategoryFilter(data){

    const categories = [...new Set(
        data.map(item => item.category).filter(Boolean)
    )];

    categories.sort();

    categories.forEach(category => {

        const option = document.createElement('option');

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);
    });
}

function getUsers(item){

    const users = [];

    if(item['user-ai'] === 'TRUE') users.push('AI');
    if(item['user-inis'] === 'TRUE') users.push('INIS');
    if(item['user-inbs'] === 'TRUE') users.push('INBS');
    if(item['user-hsin'] === 'TRUE') users.push('HSIN');
    if(item['user-pbkm'] === 'TRUE') users.push('PKBM');

    return users;
}

function renderTable(){

    const keyword =
        searchInput.value.toLowerCase().trim();

    const selectedUser =
        userFilter.value;

    const selectedCategory =
        categoryFilter.value;

    const sortType =
        sortDate.value;

    let filtered = [...allData];

    filtered = filtered.filter(item => {

        const users = getUsers(item);

        const searchable = `
            ${item['doc-title'] || ''}
            ${item['category'] || ''}
            ${item['doc-number'] || ''}
            ${users.join(' ')}
            ${item['status'] || ''}
        `.toLowerCase();

        const matchSearch =
            searchable.includes(keyword);

        const matchUser =
            !selectedUser ||
            users.includes(selectedUser);

        const matchCategory =
            !selectedCategory ||
            item.category === selectedCategory;

        return (
            matchSearch &&
            matchUser &&
            matchCategory
        );
    });

    filtered.sort((a,b) => {

        const dateA =
            new Date(a['publish-date'] || 0);

        const dateB =
            new Date(b['publish-date'] || 0);

        return sortType === 'newest'
            ? dateB - dateA
            : dateA - dateB;
    });

    if(filtered.length === 0){

        tableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    No data found
                </td>
            </tr>
        `;

        return;
    }

    tableBody.innerHTML = filtered.map(item => {

        const users = getUsers(item);

        const hasPdf =
            item['pdf-link'] &&
            item['pdf-link'].trim() !== '';

        const hasRaw =
            item['raw-link'] &&
            item['raw-link'].trim() !== '';

        const hasDoc = item['doc-link'] === 'TRUE';

        const titleClickable = hasPdf;

        const editDocument = hasRaw;

        const viewLink = item['pdf-link'];

    return `

    <tr>

        <td>
            ${item.number || '-'}
        </td>

        <td>
            ${item.category || '-'}
        </td>

        <td>
            <div>
                <strong>Number:</strong>
                ${item['doc-number'] || '-'}            
            </div>
            <div>
                <strong>Publish Date:</strong>
                ${item['publish-date'] || '-'}
            </div>

        </td>

        <td class="title-cell">

            ${
                titleClickable
                ? `
                    <a
                        class="doc-link"
                        href="${viewLink}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${item['doc-title'] || '-'}
                    </a>
                `
                : `
                    <span class="disabled-title">
                        ${item['doc-title'] || '-'}
                    </span>
                `
            }

            ${
                editDocument ? `<a class="doc-link" href="${item['raw-link']}">✏</a>` : ''
            }

        </td>

        <td>

            ${
                hasPdf
                ? `
                    <a
                        class="dl-btn pdf-btn"
                        href="${item['pdf-link']}"
                        target="_blank"
                    >
                        PDF
                    </a>
                `
                : ''
            }

            ${hasDoc
                ? `
                    <a
                        class="dl-btn doc-btn"
                        href="${item['raw-link']}"
                        target="_blank"
                    >
                        Doc
                    </a>
                `
                : ''
             }

        </td>

        <td style="white-space:normal; min-width:180px; line-height:1.4;">

            <div>
                <strong>Status:</strong>
                ${item['status'] || '-'}
            </div>

            <div>
                <strong>Effective:</strong>
                ${item['effective-date'] || '-'}
            </div>

            <div>
                <strong>Expiration:</strong>
                ${item['expiration-date'] || '-'}
            </div>

        </td>

        <td>

            <div class="user-tags">

                ${
                    users.map(user => `
                        <span class="tag ${user}">
                            ${user}
                        </span>
                    `).join('')
                }

            </div>

        </td>

    </tr>

`;

    }).join('');
}

searchInput.addEventListener(
    'input',
    renderTable
);

userFilter.addEventListener(
    'change',
    renderTable
);

categoryFilter.addEventListener(
    'change',
    renderTable
);

sortDate.addEventListener(
    'change',
    renderTable
);

loadData();
