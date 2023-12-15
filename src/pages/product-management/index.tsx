import style from "@/assets/css/user-management.module.css";
import Layout from "@/components/Layout";
import { ROLE_NAMES } from "@/constants/value";
import { useToggleModal } from "@/hooks/application.hooks";
import { authSelector, getProductListSuccess } from "@/reducer";
import { ApplicationModal } from "@/reducer/app.reducer";
import { getListCategory, getListProduct, getListProductByIdSupplier } from "@/services/api/product.api";
import { RootState } from "@/store";
import {
  EditOutlined,
  ScanOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Button,
  Input,
  InputRef,
  MenuProps,
  Space,
  Table,
  TablePaginationConfig
} from "antd";
import type { ColumnsType, ColumnType } from "antd/es/table";
import type {
  FilterConfirmProps,
  FilterValue,
  SorterResult
} from "antd/es/table/interface";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import Highlighter from "react-highlight-words";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
// import {getListRequest} from "@/services/api/request.apt";

interface Props {}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}

interface DataType {
  _id: string;
  type: string;
  IDSupplier: {
    _id: string;
    companyName: string;
    description: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    logoImage: string;
  };
  IDCategory: ({ _id: string; CategoryName: string } | string)[];
  nameProduct: string;
  pictureLinks: Array<string>;
  description: string;
  color: Array<string>;
  size: Array<string>;
  price: number;
  quantity: number;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  rating: number;
}

type DataIndex = keyof DataType;
interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
  filters?: Record<string, FilterValue>;
}
function Page({}: Props) {
  const openAddNewProduct = useToggleModal(ApplicationModal.ADD_PRODUCT_VIEW);
  const openUpdateProductView = useToggleModal(ApplicationModal.UPDATE_PRODUCT_VIEW);
  const dispatch = useDispatch();
  const {productList:data} = useSelector((state:RootState)=>state.product)
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef<InputRef>(null);
  // const [data, setData] = useState<DataType[]>();
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 100,
    },
  });
  const { roleName } = useSelector(authSelector);

  const handleUpate = async (id: string) => {
    localStorage.setItem("userId", id);
    localStorage.setItem(
      "date",
      dayjs(new Date(year, month - 1)).format("YYYY-MM")
    );
    // openUpdateSalary();
  };

  // const getData = async (month: number, year: number) => {
  //   await getListUserWorking(dayjs(new Date(year,month - 1)).format("YYYY-MM"))
  //   .then((res: any)=>{
  //     setData(res.data.result)
  //     setTableParams({
  //       ...tableParams,
  //       pagination: {
  //         ...tableParams.pagination,
  //         total: res.data.totalItems,
  //         // total: 100,
  //       },
  //     })
  //   })
  //   .catch((error: any)=>{
  //     toast.error(error.message)
  //   })
  // }

  const getData = async () => {
    await Promise.all([roleName ===ROLE_NAMES.SELLER? getListProductByIdSupplier() :getListProduct(), getListCategory()])
      .then((res: any) => {
        dispatch(
          getProductListSuccess({
            products: res[0]?.data,
            categories: res[1]?.data,
          })
        );
        // .map((item: any) => item.product)
        // .map((product: IProduct) => {
        //   return {
        //     product,
        //   };
        // });
        // setData(data);
      })
      .catch((error: any) => {
        toast.error(error.message);
      });
  };

  useEffect(() => {
    getData();
  }, []);
  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<DataType>
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      // setData([]);
    }
  };

  const handleSearch = (
    selectedKeys: string[],
    confirm: (param?: FilterConfirmProps) => void,
    dataIndex: DataIndex
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (
    dataIndex: DataIndex
  ): ColumnType<DataType> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() =>
            handleSearch(selectedKeys as string[], confirm, dataIndex)
          }
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() =>
              handleSearch(selectedKeys as string[], confirm, dataIndex)
            }
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText((selectedKeys as string[])[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });
  const onUpdateProduct = (product: any) => {
    localStorage.setItem("product", JSON.stringify(product));
    openUpdateProductView();
  };
  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "nameProduct",
      key: "nameProduct",
      width: "30%",
      ...getColumnSearchProps("nameProduct"),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      ...getColumnSearchProps("quantity"),
      sorter: (a, b) => a.quantity - b.quantity,
      width: "20%",
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      ...getColumnSearchProps("price"),
      sorter: (a, b) => a.price - b.price,
      width: "20%",
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      ...getColumnSearchProps("rating"),
      sorter: (a, b) => a.rating - b.rating,
      width: "20%",
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      ...getColumnSearchProps("type"),
      width: "20%",
      sortDirections: ["descend", "ascend"],
    },
    {
      title: "Action",
      dataIndex: "",
      key: "",
      render: (value: any, record: any, index: number) => (
        <div className="flex flex-row gap-3">
          <EditOutlined
            className="cursor-pointer"
            title="Edit user information"
            onClick={() => {
              onUpdateProduct(record);
            }}
          />
          <ScanOutlined
            className="cursor-pointer"
            title="Training face "
            onClick={() => {}}
          />
        </div>
      ),
    },
  ];

  const monthOption: MenuProps["items"] = useMemo(() => {
    const monthOption: MenuProps["items"] = [];
    for (let i = 1; i <= 12; i++) {
      const month = {
        key: i.toString(),
        label: (
          <div
            onClick={() => {
              setMonth(i);
            }}
          >
            <span>Month {i}</span>
          </div>
        ),
      };
      monthOption.push(month);
    }
    return monthOption;
  }, []);

  const yearOption: MenuProps["items"] = useMemo(() => {
    const yearOption: MenuProps["items"] = [];
    for (let i = new Date().getFullYear(); i >= 2020; i--) {
      const year = {
        key: i.toString(),
        label: (
          <div
            onClick={() => {
              setYear(i);
            }}
          >
            <span>{i}</span>
          </div>
        ),
      };
      yearOption.push(year);
    }
    return yearOption;
  }, []);

  return (
    <div className={style.user_management_wrapper}>
      {/* <p className={style.user_management_title}>Salary Management</p> */}
      <div className="flex justify-between	">
        <div className="flex gap-10 items-center">
          <p
            style={{
              display: "flex",
              marginBottom: "20px",
              fontFamily: "sans-serif",
              fontSize: "25px",
              fontWeight: 600,
            }}
          >
            Product Management
          </p>
          <span className="mb-[20px] text-[15px]">
            {month}/{year}
          </span>
        </div>
        <div className="flex gap-10">
          <Button type="default" size="large" onClick={openAddNewProduct}>
            Create Product
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        className={style.user_management_table}
      />
    </div>
  );
}
export default Page;
Page.Layout = Layout;
Page.requireAuth = true;